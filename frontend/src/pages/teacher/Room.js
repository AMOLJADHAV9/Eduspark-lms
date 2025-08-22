
import { useLocation, useParams } from 'react-router-dom'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

function randomID(len) {
  let result = '';
  if (result) return result;
  var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}


function Room() {
    const params = useParams();
    const roomId = params.id || params.roomId || '';
    const location = useLocation();
    const { name, role } = location.state || {name:"GUEST", role:"Audience"}

    const roleCondition =
        role === 'Host'
            ? ZegoUIKitPrebuilt.Host
            : ZegoUIKitPrebuilt.Audience;
    const sharedLinks = [
        {
            name: 'Join as Audience',
            url: `${window.location.origin}/room/${roomId}`,
        },
    ];

    // generate Kit Token
    const appID = 559043482;
    const serverSecret = "60725ecb3114c336a092fe3093589fe3";
    const kitToken = roomId && ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        randomID(5),
        name
    );
    let myMeeting = async (element) => {
        // Create instance object from Kit Token.
        if (!roomId) {
            console.error('Zego room ID is empty. Ensure the URL contains an id, e.g., /teacher/room/123');
            return;
        }
        if (!kitToken) {
            console.error('Failed to generate ZEGOCLOUD kit token. Check appID/serverSecret.');
            return;
        }
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        if (!zp) {
            console.error('Failed to create ZEGOCLOUD instance.');
            return;
        }
        // start the call
        zp.joinRoom({
            container: element,
            scenario: {
                mode: ZegoUIKitPrebuilt.LiveStreaming,
                config: {
                    role: roleCondition,
                },
            },
            sharedLinks,
        });
    };

    return (
        <div>
            <div
                className="myCallContainer"
                ref={myMeeting}
                style={{ width: '100vw', height: '100vh' }}
            >

            </div>

        </div>

    )
}

export default Room;