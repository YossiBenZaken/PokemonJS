import React from "react";

interface UBBCodeProps {
  text: string;
}

const smileys: Record<string, string> = {
  ":)": "001.png",
  ":D": "002.png",
  xD: "003.png",
  ":P": "004.png",
  ";)": "005.png",
  ":S": "006.png",
  ":O": "007.png",
  "8-)": "008.png",
  ":*": "009.png",
  ":(": "010.png",
  ":'(": "011.png",
  ":|": "012.png",
  ":b": "013.png",
  "(BOO)": "014.png",
  "(zZZ)": "015.png",
  ":v": "016.png",
  "(GRR)": "017.png",
  ":3": "018.png",
  "@-)": "019.png",
  o_O: "020.png",
  "._.": "021.png",
  "(S2)": "022.png",
};

export const UBBCode: React.FC<UBBCodeProps> = ({ text }) => {
  let processed = text;

  // הסרת < ו->
  processed = processed.replace(/</g, "").replace(/>/g, "");

  // להמיר שורות ל-br
  processed = processed.replace(/\n/g, "<br />");

  // סמיילים
  Object.entries(smileys).forEach(([key, img]) => {
    const regex = new RegExp(key.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "g");
    processed = processed.replace(regex, `<img src="/images/emoticons/${img}" alt="${key}" />`);
  });

  // BBCode בסיסי
  const bbcodePatterns: [RegExp, string][] = [
    [/\[b\](.*?)\[\/b\]/gi, "<strong>$1</strong>"],
    [/\[i\](.*?)\[\/i\]/gi, "<i>$1</i>"],
    [/\[u\](.*?)\[\/u\]/gi, "<u>$1</u>"],
    [/\[s\](.*?)\[\/s\]/gi, "<s>$1</s>"],
    [
      /\[center\](.*?)\[\/center\]/gi,
      "<div style='text-align:center'>$1</div>",
    ],
    [/\[quote\](.*?)\[\/quote\]/gi, "<div class='quote'>$1</div>"],
    [
      /\[url\](https?:\/\/[^\]]+)\[\/url\]/gi,
      "<a href='$1' target='_blank'>$1</a>",
    ],
    [/\[img\]([^\]]+)\[\/img\]/gi, "<img src='$1' style='max-width:660px;' />"],
    [
      /\[color=(#[0-9A-Fa-f]{6}|[a-z-]+)\](.*?)\[\/color\]/gi,
      "<span style='color:$1'>$2</span>",
    ],
  ];

  bbcodePatterns.forEach(([pattern, replacement]) => {
    processed = processed.replace(pattern, replacement);
  });

  // Pokémon tags
  const pokemonPatterns: [RegExp, string][] = [
    [
      /\[pokemon\]([^[]+)\[\/pokemon\]/gi,
      `<img src="/images/pokemon/$1.gif" />`,
    ],
    [
      /\[shiny\]([^[]+)\[\/shiny\]/gi,
      `<img src="/images/shiny/$1.gif" />`,
    ],
    [
      /\[icon\]([^[]+)\[\/icon\]/gi,
      `<img src="/images/pokemon/icon/$1.gif" />`,
    ],
    [
      /\[icon_shiny\]([^[]+)\[\/icon_shiny\]/gi,
      `<img src="/images/shiny/icon/$1.gif" />`,
    ],
    [
      /\[back\]([^[]+)\[\/back\]/gi,
      `<img src="/images/pokemon/back/$1.gif" />`,
    ],
    [
      /\[back_shiny\]([^[]+)\[\/back_shiny\]/gi,
      `<img src="/images/shiny/back/$1.gif" />`,
    ],
    [
      /\[animatie\]([^[]+)\[\/animatie\]/gi,
      `<img src="/images/pokemon/icon/$1.gif" />`,
    ],
  ];

  pokemonPatterns.forEach(([pattern, replacement]) => {
    processed = processed.replace(pattern, replacement);
  });

  // YouTube tags
  processed = processed.replace(
    /\[youtube\](?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)\[\/youtube\]/gi,
    `<iframe width="425" height="355" src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>`
  );
  processed = processed.replace(
    /\[youtube\]([a-zA-Z0-9_-]+)\[\/youtube\]/gi,
    `<iframe width="425" height="355" src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>`
  );

  return <span dangerouslySetInnerHTML={{ __html: processed }} />;
};
