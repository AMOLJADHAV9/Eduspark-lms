import React, { useEffect, useRef, useState } from 'react';
import { Box, VStack, Text, Spinner, Center, useToast } from '@chakra-ui/react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuth } from '../context/AuthContext';

const ZegoLiveStream = ({ liveClass, onJoin, currentUserName, currentUserRole, currentUserId }) => {
  const containerRef = useRef(null);
  const { token: authToken, apiBaseUrl } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let zp;
    const init = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBaseUrl}/api/live-classes/${liveClass._id}/zego-token`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` }
        });
        let data = null;
        if (res.ok) {
          data = await res.json();
        }

        // If server failed, try client-side fallback for development
        if (!res.ok || !data?.token) {
          const appID = Number(process.env.REACT_APP_ZEGO_APP_ID || 0);
          const serverSecret = process.env.REACT_APP_ZEGO_SERVER_SECRET;
          if (!appID || !serverSecret) {
            const serverMsg = res.ok ? 'No token returned' : (await res.json().catch(() => ({}))).message || 'Server error';
            throw new Error(`Failed to get Zego token (${serverMsg}). Also missing REACT_APP_ZEGO_* for fallback.`);
          }

          const roomId = liveClass.zegoRoomId || liveClass._id;
          const userId = currentUserId || Math.random().toString(36).slice(2);
          const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomId, userId, currentUserName || 'Guest');
          zp = ZegoUIKitPrebuilt.create(kitToken);
        } else {
          zp = ZegoUIKitPrebuilt.create(data.token);
        }
        const role = currentUserRole === 'Host' ? ZegoUIKitPrebuilt.Host : ZegoUIKitPrebuilt.Audience;

        zp.joinRoom({
          container: containerRef.current,
          sharedLinks: [
            {
              name: 'Join as Audience',
              url: `${window.location.origin}/live-class/${liveClass._id}`,
            },
          ],
          scenario: {
            mode: ZegoUIKitPrebuilt.LiveStreaming,
            config: { role },
          },
        });

        if (onJoin) onJoin(liveClass);
      } catch (e) {
        console.error(e);
        toast({ title: 'Zego error', description: e.message, status: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (liveClass && containerRef.current) {
      init();
    }

    return () => {
      // cleanup handled by Zego UIKit
    };
  }, [liveClass, apiBaseUrl, authToken, currentUserRole, onJoin, toast]);

  return (
    <Box>
      {loading && (
        <Center>
          <VStack>
            <Spinner size="lg" color="teal.500" />
            <Text>Connecting to live stream…</Text>
          </VStack>
        </Center>
      )}
      <Box ref={containerRef} style={{ width: '100%', height: '70vh' }} />
    </Box>
  );
};

export default ZegoLiveStream;


