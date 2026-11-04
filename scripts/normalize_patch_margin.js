const fs = require('fs');
const path = require('path');

const marginPath = path.join(__dirname, '../src/components/MarginSelectionModal.tsx');
let marginCode = fs.readFileSync(marginPath, 'utf8');

// Normalize CRLF to LF temporarily
const isCRLF = marginCode.includes('\r\n');
if (isCRLF) {
  marginCode = marginCode.replaceAll('\r\n', '\n');
}

const targetActive = `  const activeChannel = useMemo(() => {
    return channels.find(c => c.id === selectedChannel) || channels[0];
  }, [channels, selectedChannel]);`;

const replacementActive = `  const activeChannel = useMemo(() => {
    return channels.find(c => c.id === selectedChannel) || channels[0];
  }, [channels, selectedChannel]);

  const channelConnectionMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const ch of channels) {
      map[ch.id] = isChannelConnected(ch.id, userEmail);
    }
    return map;
  }, [channels, userEmail]);

  const isCurrentChannelConnected = !!channelConnectionMap[selectedChannel];`;

if (marginCode.includes(targetActive)) {
  marginCode = marginCode.replace(targetActive, replacementActive);
  console.log('Successfully replaced activeChannel and added channelConnectionMap!');
} else {
  console.error('targetActive not found even with normalized line breaks!');
}

if (isCRLF) {
  marginCode = marginCode.replaceAll('\n', '\r\n');
}

fs.writeFileSync(marginPath, marginCode, 'utf8');
