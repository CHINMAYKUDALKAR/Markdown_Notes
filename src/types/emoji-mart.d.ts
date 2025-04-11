
declare module '@emoji-mart/react' {
  import React from 'react';

  interface EmojiMartProps {
    data: any;
    onEmojiSelect?: (emoji: { native: string, id: string, [key: string]: any }) => void;
    theme?: string;
    previewPosition?: string;
    skinTonePosition?: string;
    searchPosition?: string;
    set?: string;
    [key: string]: any;
  }

  const Picker: React.FC<EmojiMartProps>;
  export default Picker;
}

declare module '@emoji-mart/data' {
  const data: any;
  export default data;
}
