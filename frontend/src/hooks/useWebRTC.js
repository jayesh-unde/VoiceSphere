import { useEffect, useState, useRef, useCallback } from 'react';
import { ACTIONS } from '../actions';
import socketInit from '../socket';
import freeice from 'freeice';
import { useStateWithCallback } from './useStateWithCallback';
import { FFT } from 'dsp.js';

export const useWebRTC = (roomId, user) => {
    const [clients, setClients] = useStateWithCallback([]);
    const audioElements = useRef({});
    const connections = useRef({});
    const socket = useRef(null);
    const localMediaStream = useRef(null);
    const clientsRef = useRef(null);

    const addNewClient = useCallback(
        (newClient, cb) => {
            const lookingFor = clients.find(
                (client) => client.id === newClient.id
            );

            if (lookingFor === undefined) {
                setClients(
                    (existingClients) => [...existingClients, newClient],
                    cb
                );
            }
        },
        [clients, setClients]
    );

    useEffect(() => {
        clientsRef.current = clients;
    }, [clients]);

    useEffect(() => {
        const initChat = async () => {
            socket.current = socketInit();
            await captureMedia();
            addNewClient({ ...user, muted: true }, () => {
                const localElement = audioElements.current[user.id];
                if (localElement) {
                    localElement.volume = 0;
                    localElement.srcObject = localMediaStream.current;
                }
            });

            socket.current.on(ACTIONS.MUTE_INFO, ({ userId, isMute }) => {
                handleSetMute(isMute, userId);
            });

            socket.current.on(ACTIONS.ADD_PEER, handleNewPeer);
            socket.current.on(ACTIONS.REMOVE_PEER, handleRemovePeer);
            socket.current.on(ACTIONS.ICE_CANDIDATE, handleIceCandidate);
            socket.current.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia);
            socket.current.on(ACTIONS.MUTE, ({ peerId, userId }) => {
                handleSetMute(true, userId);
            });
            socket.current.on(ACTIONS.UNMUTE, ({ peerId, userId }) => {
                handleSetMute(false, userId);
            });
            socket.current.emit(ACTIONS.JOIN, {
                roomId,
                user,
            });

            async function captureMedia() {
                const constraints = {
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        highpassFilter: true,
                        channelCount: 1,
                        sampleRate: 1000,
                        sampleSize: 10,
                        volume: 0.8,
                    },
                };

                try {
                    const stream = await navigator.mediaDevices.getUserMedia(constraints);
                    const audioContext = new AudioContext();
                    const source = audioContext.createMediaStreamSource(stream);

                    // Create a gain node for volume control
                    const gainNode = audioContext.createGain();
                    gainNode.gain.value = 2.0;

                    // Create a biquad filter node for noise suppression
                    const biquadFilter = audioContext.createBiquadFilter();
                    biquadFilter.type = 'lowpass';
                    biquadFilter.frequency.setValueAtTime(1000, audioContext.currentTime);

                   
                    // Create an analyser node for FFT
                    const analyser = audioContext.createAnalyser();
                    analyser.fftSize = 4096;
                    const bufferLength = analyser.frequencyBinCount;
                    const dataArray = new Uint8Array(bufferLength);

                    source.connect(gainNode)
            .connect(biquadFilter)
            .connect(analyser);

                    localMediaStream.current = stream;

                    // Function to process audio data
                    function processAudio() {
                        analyser.getByteTimeDomainData(dataArray);
                        const fft = new FFT(bufferLength, audioContext.sampleRate);
                        fft.forward(dataArray);
                        // Perform noise suppression based on FFT data
                        requestAnimationFrame(processAudio);
                    }

                    processAudio();
                } catch (err) {
                    console.error('Error capturing media:', err);
                }
            }

            async function handleNewPeer({ peerId, createOffer, user: remoteUser }) {
                if (peerId in connections.current) {
                    return console.warn(`You are already connected with ${peerId} (${user.name})`);
                }

                const pcConfig = {
                    iceServers: freeice(),
                    sdpSemantics: 'unified-plan',
                    bundlePolicy: 'max-bundle',
                    rtcpMuxPolicy: 'require',
                    iceTransportPolicy: 'all',
                    iceCandidatePoolSize: 2,
                };

                connections.current[peerId] = new RTCPeerConnection(pcConfig);

                connections.current[peerId].onicecandidate = (event) => {
                    socket.current.emit(ACTIONS.RELAY_ICE, {
                        peerId,
                        icecandidate: event.candidate,
                    });
                };

                connections.current[peerId].ontrack = ({ streams: [remoteStream] }) => {
                    addNewClient({ ...remoteUser, muted: true }, () => {
                        const currentUser = clientsRef.current.find((client) => client.id === user.id);
                        if (currentUser) {
                            socket.current.emit(ACTIONS.MUTE_INFO, {
                                userId: user.id,
                                roomId,
                                isMute: currentUser.muted,
                            });
                        }
                        if (audioElements.current[remoteUser.id]) {
                            audioElements.current[remoteUser.id].srcObject = remoteStream;
                        } else {
                            let settled = false;
                            const interval = setInterval(() => {
                                if (audioElements.current[remoteUser.id]) {
                                    audioElements.current[remoteUser.id].srcObject = remoteStream;
                                    settled = true;
                                }
                                if (settled) {
                                    clearInterval(interval);
                                }
                            }, 300);
                        }
                    });
                };

                localMediaStream.current.getTracks().forEach((track) => {
                    connections.current[peerId].addTrack(track, localMediaStream.current);
                });

                if (createOffer) {
                    const offer = await connections.current[peerId].createOffer();
                    offer.sdp = prioritizeOpus(offer.sdp);
                    await connections.current[peerId].setLocalDescription(offer);

                    socket.current.emit(ACTIONS.RELAY_SDP, {
                        peerId,
                        sessionDescription: connections.current[peerId].localDescription,
                    });
                }
            }

            async function handleRemovePeer({ peerId, userId }) {
                if (connections.current[peerId]) {
                    connections.current[peerId].close();
                }

                delete connections.current[peerId];
                delete audioElements.current[peerId];
                setClients((list) => list.filter((c) => c.id !== userId));
            }

            async function handleIceCandidate({ peerId, icecandidate }) {
                if (icecandidate) {
                    connections.current[peerId].addIceCandidate(icecandidate);
                }
            }

            async function setRemoteMedia({ peerId, sessionDescription: remoteSessionDescription }) {
                const connection = connections.current[peerId];
                await connection.setRemoteDescription(new RTCSessionDescription(remoteSessionDescription));

                if (remoteSessionDescription.type === 'offer') {
                    const answer = await connection.createAnswer();
                    answer.sdp = prioritizeOpus(answer.sdp);
                    await connection.setLocalDescription(answer);

                    socket.current.emit(ACTIONS.RELAY_SDP, {
                        peerId,
                        sessionDescription: connection.localDescription,
                    });
                }
            }

            async function handleSetMute(mute, userId) {
                const clientIdx = clientsRef.current.map((client) => client.id).indexOf(userId);
                const allConnectedClients = JSON.parse(JSON.stringify(clientsRef.current));
                if (clientIdx > -1) {
                    allConnectedClients[clientIdx].muted = mute;
                    setClients(allConnectedClients);
                }
            }
        };

        initChat();
        return () => {
            localMediaStream.current.getTracks().forEach((track) => track.stop());
            socket.current.emit(ACTIONS.LEAVE, { roomId });
            for (let peerId in connections.current) {
                connections.current[peerId].close();
                delete connections.current[peerId];
                delete audioElements.current[peerId];
            }
            socket.current.off(ACTIONS.ADD_PEER);
            socket.current.off(ACTIONS.REMOVE_PEER);
            socket.current.off(ACTIONS.ICE_CANDIDATE);
            socket.current.off(ACTIONS.SESSION_DESCRIPTION);
            socket.current.off(ACTIONS.MUTE);
            socket.current.off(ACTIONS.UNMUTE);
        };
    }, []);

    const provideRef = (instance, userId) => {
        audioElements.current[userId] = instance;
    };

    const handleMute = (isMute, userId) => {
        let settled = false;

        if (userId === user.id) {
            let interval = setInterval(() => {
                if (localMediaStream.current) {
                    localMediaStream.current.getTracks()[0].enabled = !isMute;
                    if (isMute) {
                        socket.current.emit(ACTIONS.MUTE, {
                            roomId,
                            userId: user.id,
                        });
                    } else {
                        socket.current.emit(ACTIONS.UNMUTE, {
                            roomId,
                            userId: user.id,
                        });
                    }
                    settled = true;
                }
                if (settled) {
                    clearInterval(interval);
                }
            }, 200);
        }
    };

    return {
        clients,
        provideRef,
        handleMute,
    };
};

function prioritizeOpus(sdp) {
    const sdpLines = sdp.split('\r\n');
    const mLineIndex = sdpLines.findIndex(line => line.startsWith('m=audio'));
    if (mLineIndex === -1) return sdp;

    const opusPayloadLine = sdpLines.find(line => line.includes('opus/48000'));
    if (!opusPayloadLine) return sdp;

    const opusPayloadType = opusPayloadLine.match(/(\d+)/)[0];

    const mLineElements = sdpLines[mLineIndex].split(' ');
    const newMLineElements = [
        ...mLineElements.slice(0, 3),
        opusPayloadType,
        ...mLineElements.slice(3).filter(pt => pt !== opusPayloadType)
    ];

    sdpLines[mLineIndex] = newMLineElements.join(' ');

    return sdpLines.join('\r\n');
}
