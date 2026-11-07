export type ProfileTheme = {
  style: 'midnight' | 'emerald' | 'fairytale';
  background: string;
  surface: string;
  primary: string;
  accent: string;
  text: string;
  glow: string;
  secondary: string;
};

export type WishItem = {
  icon: string;
  text: string;
};

export type StoryContent = {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  chapter?: string;
  characterScene?: 'castle' | 'moon' | 'rakhi' | 'garden' | 'festival';
  revealParagraphs?: string[];
  delayedNext?: boolean;
  items?: WishItem[];
  visual?: 'balcony' | 'polaroids' | 'sisterhood' | 'siblings' | 'rakhi' | 'celebration';
};

export type PrivateProfile = {
  id: string;
  name: string;
  nickname: string;
  pin: string;
  chapterFlow?: boolean;
  welcomeMessage?: string[];
  theme: ProfileTheme;
  content: {
    hero: {
      kicker: string;
      title: string;
      subtitle: string;
      invitation: string;
      includeIntro: boolean;
      continueLabel?: string;
    };
    intro: StoryContent;
    story: StoryContent[];
    specialSection?: {
      title: string;
      buttonText: string;
      content: string[];
    };
    gratitude: StoryContent;
    finale: {
      title: string;
      message: string[];
      visual?: 'sisterhood' | 'siblings';
    };
    finalMessage: {
      eyebrow?: string;
      title?: string;
      buttonText?: string;
      visual?: 'sisterhood' | 'siblings';
      lines: string[];
      signoff: string;
      signature: string;
    };
  };
};

export const profiles: PrivateProfile[] = [
  {
    id: 'anushka',
    name: 'Anushka',
    nickname: 'Anuuuu',
    pin: '0223',
    theme: {
      style: 'midnight',
      background: '#10091d',
      surface: '#25142d',
      primary: '#ffd298',
      secondary: '#512b5c',
      accent: '#ffad54',
      text: '#fff4e8',
      glow: '#d9a441',
    },
    content: {
      hero: {
        kicker: 'A LITTLE DIWALI WISH',
        title: 'A Little Diwali Wish',
        subtitle: 'For My {nickname} 🪔✨',
        invitation: 'Light this diya, {nickname}… 🪔✨',
        includeIntro: false,
      },
      intro: {
        eyebrow: 'A little something I wanted to say',
        title: 'Hey {nickname}…!',
        paragraphs: [
          'Wait… don’t click anything yet. 😄',
          'This Diwali, I wanted to wish you in a slightly different way…',
        ],
      },
      story: [
        {
          eyebrow: 'A little something I realized',
          title: 'You know what’s funny?',
          paragraphs: [
            'Sometimes a person doesn’t have to be physically beside us',
            'to make us feel that they’re there. ❤️',
          ],
        },
        {
          eyebrow: 'Some people just feel like home',
          title: 'You came into my life recently…',
          paragraphs: [
            '…but somehow became one of those people',
            'I know I can count on. ❤️',
          ],
        },
        {
          eyebrow: 'And I haven’t forgotten',
          title: 'There were times when I wasn’t really at my best…',
          paragraphs: [
            'times when I felt low, confused,',
            'or just needed someone around…',
            'And somehow, you were there. ❤️',
          ],
          visual: 'balcony',
        },
        {
          eyebrow: 'A very serious observation',
          title: 'You may be smaller than me… 😂',
          paragraphs: [
            '…but sometimes the way you’ve supported me',
            'feels like you’re the elder one. ❤️',
          ],
          visual: 'polaroids',
        },
      ],
      specialSection: {
        title: 'My little Delulu ✨',
        buttonText: 'Why are you called Delulu? 👀',
        content: [
          '“Delulu” usually means being a little delusional — imagining things, getting lost in your own little world, or believing in something a little too much. 😂',
          'But for me, it’s not a bad thing.',
          'It’s you being unapologetically you.',
          'The random things you say. The funny stories you create. The overthinking. The cute assumptions. And the way you can turn even a simple moment into a whole new world. 😂',
          'In short… you’re a little crazy. But I wouldn’t want you any other way. ❤️',
          'That’s why you’re my little Delulu. ✨',
        ],
      },
      gratitude: {
        eyebrow: 'And honestly…',
        title: 'I’m really glad that our paths crossed. ❤️',
        paragraphs: [
          'You’re one of those people who make life',
          'a little lighter, a little happier,',
          'and a lot more bearable. ✨',
        ],
      },
      finale: {
        title: 'Happy Diwali, {nickname}! 🪔✨',
        message: [
          'May your life always be filled with the same kind of light, happiness and warmth that you’ve unknowingly brought into the lives of the people around you. ❤️',
        ],
      },
      finalMessage: {
        lines: [
          'Keep smiling.',
          'Keep being you.',
          'Keep annoying me. 😂',
          'Keep being that slightly-delulu person you are. ❤️',
        ],
        signoff: 'With lots of respect, gratitude, and a big Diwali hug 🤗',
        signature: '— Your bigger-but-sometimes-less-mature bestie/bro ❤️',
        buttonText: 'Replay ✨',
      },
    },
  },
  {
    id: 'dhanushka',
    name: 'Dhanushka',
    nickname: 'Dhanushka',
    pin: '3015',
    theme: {
      style: 'emerald',
      background: '#061b12',
      surface: '#0b2d1c',
      primary: '#123d25',
      accent: '#f5c76b',
      text: '#fff4d6',
      glow: '#d9a441',
      secondary: '#0b2d1c',
    },
    content: {
      hero: {
        kicker: 'DHANUSHKA',
        title: 'A Little Diwali Wish',
        subtitle: 'Just for You ♡',
        invitation: 'Light this diya, {nickname}… 🪔✨',
        includeIntro: true,
      },
      intro: {
        eyebrow: 'For a sister by heart',
        title: 'Hey {nickname}… 🪔',
        paragraphs: [
          'Some people enter our lives as friends…',
          'and somewhere along the way, they become family. ❤️',
        ],
      },
      story: [
        {
          eyebrow: 'A friendship I treasure',
          title: 'A Friendship That Means a Lot ♡',
          paragraphs: [
            'You’ve given me something much more valuable than just a friendship.',
            'You’ve given me moments that made me feel cared for, words that made me feel supported, and a kind of trust that isn’t easy to find.',
          ],
        },
        {
          eyebrow: 'Family, found along the way',
          title: 'A Sister By Heart ♡',
          paragraphs: [
            'When I think about you, I don’t just think about a friend.',
            'I think about someone who became a sister by heart. ♡',
          ],
          visual: 'sisterhood',
        },
        {
          eyebrow: 'A little Diwali wish for you',
          title: 'This Diwali, I Wish For You… ♡',
          paragraphs: [],
          items: [
            {
              icon: '☀',
              text: 'I hope every light around you reminds you of how much brightness you’ve brought into the lives of people around you.',
            },
            {
              icon: '♡',
              text: 'I hope you get happiness that stays longer than the fireworks.',
            },
            {
              icon: '✦',
              text: 'I hope you get peace when life gets a little noisy.',
            },
            {
              icon: '♡',
              text: 'And I hope you always have people around you who care for you the way you deserve.',
            },
          ],
        },
      ],
      gratitude: {
        eyebrow: 'A little from the heart',
        title: 'Thank You… ♡',
        paragraphs: [
          'Thank you for being more than just a friend.',
          'My lifetime best friend. My sister by heart.',
          'For the endless conversations, the random plans, the silly moments, the support, the care, and for simply being YOU…',
          'I’m genuinely grateful to have you in my life. ♡',
        ],
      },
      finale: {
        title: 'Happy Diwali,\n{nickname}! ♡',
        visual: 'sisterhood',
        message: [
          'May our friendship keep collecting memories, laughs, stupid conversations, and beautiful moments for many more Diwalis. ♡',
        ],
      },
      finalMessage: {
        lines: [],
        eyebrow: 'One last little wish',
        title: 'Happy Diwali, {nickname} 🪔✨',
        buttonText: 'Replay ↻',
        visual: 'sisterhood',
        signoff: 'With lots of respect, gratitude, and a big Diwali hug ♡',
        signature: '',
      },
    },
  },
  {
    id: 'navyasri',
    name: 'NavyaSri',
    nickname: 'NavyaSri',
    pin: '0606',
    chapterFlow: true,
    welcomeMessage: [
      'My Sister.',
      'My Best Friend.',
      'My Family by Heart.',
    ],
    theme: {
      style: 'fairytale',
      background: '#090d25',
      surface: '#251b49',
      primary: '#38245f',
      accent: '#e9c987',
      text: '#fff2df',
      glow: '#e2a95b',
      secondary: '#30204f',
    },
    content: {
      hero: {
        kicker: 'CHAPTER I',
        title: 'A Little Diwali Story',
        subtitle: 'My Sister. My Best Friend. My Family by Heart.',
        invitation: 'A little Diwali story',
        includeIntro: true,
        continueLabel: 'Continue',
      },
      intro: {
        eyebrow: 'A little Diwali story',
        title: 'My Sister. My Best Friend. ♡',
        paragraphs: [
          'Some people enter our lives as friends…',
          'and somehow become family.',
          'You became my sister through the way you treated me.',
          'And I’ll always be grateful for that.',
        ],
      },
      story: [
        {
          chapter: 'CHAPTER II',
          eyebrow: 'A sister who chose me',
          title: 'Sister by Heart',
          characterScene: 'moon',
          paragraphs: [
            'You never treated me like just another friend.',
            'You always treated me like your own brother.',
            'And that means more to me than I can properly explain.',
          ],
        },
        {
          chapter: 'CHAPTER III',
          eyebrow: 'The memory I’ll never forget',
          title: 'The Rakhi',
          characterScene: 'rakhi',
          paragraphs: [
            'There is one Rakshabandhan memory I know I’ll never forget.',
            'You already had two brothers of your own.',
            'But you didn’t go home that day.',
            'You stayed here in college…',
            'and tied a Rakhi to me.',
          ],
          revealParagraphs: [
            'You chose me as your brother.',
          ],
          delayedNext: true,
        },
        {
          chapter: 'CHAPTER IV',
          eyebrow: 'A little thread, so much meaning',
          title: 'That One Rakhi',
          characterScene: 'rakhi',
          paragraphs: [
            'For me, that wasn’t just a Rakhi.',
            'It was a memory.',
            'A reminder that somewhere in your heart, you had given me a place as your brother.',
            'You didn’t have to do it. You chose to.',
            'And I will never forget that.',
          ],
        },
        {
          chapter: 'CHAPTER V',
          eyebrow: 'A bond I will always cherish',
          title: 'My Sister',
          characterScene: 'garden',
          paragraphs: [
            'I may not be your brother by blood…',
            'but you’ve always treated me like one.',
            'And I will always respect and cherish that bond.',
            'Thank you for giving me a place as your brother.',
          ],
          revealParagraphs: ['SISTER BY HEART ♡'],
          delayedNext: true,
        },
        {
          chapter: 'CHAPTER VI',
          eyebrow: 'A Diwali wish from my heart',
          title: 'My Wishes For You',
          characterScene: 'garden',
          paragraphs: [],
          items: [
            { icon: '🪔', text: 'May happiness always find you.' },
            { icon: '✨', text: 'May you achieve everything you dream of.' },
            { icon: '🌙', text: 'May your life always be filled with peace and light.' },
            { icon: '❤️', text: 'May you always have people around you who truly value you.' },
          ],
        },
        {
          chapter: 'CHAPTER VII',
          eyebrow: 'The lights are brighter tonight',
          title: 'Happy Diwali, NavyaSri 🪔✨',
          characterScene: 'festival',
          visual: 'celebration',
          paragraphs: [
            'To my sister.',
            'To the person who chose me as her brother.',
            'And to a bond that I’ll always value.',
          ],
        },
      ],
      gratitude: {
        eyebrow: 'The lights are getting brighter',
        title: 'Happy Diwali, NavyaSri! 🪔✨',
        paragraphs: [
          'May this Diwali bring you all the happiness and light you deserve.',
        ],
        visual: 'celebration',
      },
      finale: {
        title: 'Happy Diwali, NavyaSri! 🪔✨',
        visual: 'siblings',
        message: [
          'My sister by heart. My best friend by choice. My family in every way that matters. ♡',
          'I’ll always remember the day you stayed in college, even though you had your own brothers at home, and tied a Rakhi to me.',
          'That memory will always have a special place in my heart.',
          'Happy Diwali, Sister. ❤️',
        ],
      },
      finalMessage: {
        eyebrow: 'FINAL CHAPTER',
        title: 'One Memory I’ll Always Keep',
        buttonText: 'Replay ↻',
        lines: [
          'Dear NavyaSri,',
          'I’ll always remember that Rakshabandhan.',
          'You already had two brothers of your own.',
          'Yet you stayed here in college and tied a Rakhi to me.',
          'You didn’t have to. You chose to.',
          'And that meant more to me than you probably realize.',
          'Thank you for treating me like your own brother.',
          'Thank you for giving me the bond of a sister.',
          'And thank you for becoming such a special part of my life.',
          'That Rakhi will always remain a beautiful memory for me.',
        ],
        signoff: 'Happy Diwali, Sister. 🪔❤️',
        signature: '— Your Brother',
      },
    },
  },
];
