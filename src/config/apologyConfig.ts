// Central Apology Configuration for Windows 95: The Sorry Computer
// All personalized copy, options, charges, products, dialogues, and settings reside here.

export interface ApologyConfig {
  couple: {
    girlfriendName: string;
    boyfriendName: string;
    anniversaryDate?: string;
    nickname?: string;
  };
  hotline: {
    phoneNumber: string;
    greetingText: string;
    defaultAudioUrl?: string;
    menuOptions: Array<{
      key: string;
      label: string;
      extension: string;
      title: string;
      script: string;
      audioUrl?: string;
    }>;
  };
  court: {
    caseNumber: string;
    courtName: string;
    defendantName: string;
    judgeName: string;
    clerkIntroduction: string;
    charges: Array<{
      id: string;
      title: string;
      severity: string;
      description: string;
      prosecutionArgument: string;
      defendantPlea: string;
    }>;
    evidence: Array<{
      id: string;
      title: string;
      type: 'document' | 'chart' | 'statement' | 'photo';
      description: string;
      content: string;
    }>;
    defendantApologyStatement: string;
    verdicts: Array<{
      id: 'guilty' | 'dismissed' | 'need_time';
      title: string;
      description: string;
      statusBadge: string;
    }>;
    defaultSentences: Array<{
      id: string;
      label: string;
      description: string;
    }>;
  };
  vending: {
    currencyName: string;
    initialCredits: number;
    coinValue: number;
    products: Array<{
      id: string;
      code: string;
      name: string;
      price: number;
      category: string;
      description: string;
      icon: string;
      color: string;
      dispensedContent: {
        headline: string;
        body: string;
        couponCode?: string;
        voucherText?: string;
        note?: string;
      };
    }>;
  };
  bossFight: {
    bossName: string;
    bossTitle: string;
    playerTitle: string;
    phases: Array<{
      hpThreshold: number; // percentage
      quote: string;
    }>;
    defeatQuote: string;
    victoryMessage: string;
  };
  delivery: {
    trackingNumber: string;
    carrierName: string;
    courierName: string;
    itemDescription: string;
    stages: Array<{
      step: number;
      title: string;
      status: string;
      timestampOffset: string;
      details: string;
      icon: string;
    }>;
    receiptClosingMessage: string;
  };
}

export const apologyConfig: ApologyConfig = {
  couple: {
    girlfriendName: 'My Sweetheart',
    boyfriendName: 'Your Boyfriend',
    anniversaryDate: 'Always & Forever',
    nickname: 'Cutie Pie',
  },
  hotline: {
    phoneNumber: '1-800-IM-SORRY',
    greetingText:
      'Welcome to the 24/7 Apology Hotline. All operators are currently on standby admitting their mistakes. Please listen carefully as our menu options have changed to acknowledge that you were 100% right.',
    defaultAudioUrl: '/sounds/apology-voice.mp3',
    menuOptions: [
      {
        key: '1',
        extension: '101',
        label: "Today's Complaint Against Me",
        title: 'Docket #101: The Incident Report',
        script:
          'You have reached Complaint Line 101. Incident Summary: The defendant failed to read the room, offered unsolicited logic when all that was needed was unconditional support and a big warm hug, and exhibited stubbornness of unusual magnitude. Verdict: Total blunder.',
      },
      {
        key: '2',
        extension: '102',
        label: 'My Completely Unnecessary Excuses',
        title: 'Excuse Archive #102: Rejected Submissions',
        script:
          "Archive retrieval in progress... Found excuses: 1. 'I was distracted.' 2. 'I thought you meant something else.' 3. 'My brain glitched.' Status: All excuses have been audited by the Department of Common Sense and found completely invalid.",
      },
      {
        key: '3',
        extension: '103',
        label: 'What I Should Have Said',
        title: 'Correction File #103: The Proper Response',
        script:
          "Official statement correction: 'I hear you, I value how you feel, and I am truly sorry for hurting you. Your comfort and feelings mean the world to me, and nothing matters more than making you smile again.'",
      },
      {
        key: '4',
        extension: '104',
        label: 'Speak Directly to the Person Who Owes You an Apology',
        title: 'Direct Line #104: Personal Audio Apology',
        script:
          "Hey my love, if you're hearing this: I am genuinely so sorry. I hate seeing any distance between us. I love you with all my heart, I am listening, and I want to make things right. You deserve the gentlest love and patience in the universe.",
      },
      {
        key: '0',
        extension: '000',
        label: 'Operator / Emergency Hugs Dispatch',
        title: 'Emergency Line #000: Instant Affection Unit',
        script:
          'Dispatching 10,000 emergency warm hugs, your favorite comfort snacks, and unlimited forehead kisses directly to your coordinates.',
      },
    ],
  },
  court: {
    caseNumber: 'CASE-2026-SRY-001',
    courtName: 'THE HIGH COURT OF HER NAME',
    defendantName: 'The Boyfriend',
    judgeName: 'The Honorable Girlfriend',
    clerkIntroduction:
      'All rise! The Court of Her Name is now in session. The Honorable Judge presiding. On the docket today: The Matter of Egregious Stubbornness, Clueless Behavior, and Unwarranted Defensiveness.',
    charges: [
      {
        id: 'charge-1',
        title: 'Count 1: Failure to Understand Her Feelings',
        severity: 'Class A Emotional Negligence',
        description: 'The defendant failed to perceive emotional cues and prioritised literal explanations over empathy.',
        prosecutionArgument: 'The complainant clearly expressed frustration, yet the defendant offered unsolicited analysis instead of comfort.',
        defendantPlea: 'Plea: GUILTY. No contest. Total failure of empathy on my part.',
      },
      {
        id: 'charge-2',
        title: 'Count 2: Being Unnecessarily Stubborn',
        severity: 'Obstruction of Good Vibes (Felony)',
        description: 'The defendant dug his heels in and refused to admit he was mistaken for an unreasonably long duration.',
        prosecutionArgument: 'Pride and stubbornness were maintained even when it was abundantly clear that he was in the wrong.',
        defendantPlea: 'Plea: GUILTY. Defenses dismantled. My ego was foolish and completely unwarranted.',
      },
      {
        id: 'charge-3',
        title: 'Count 3: Inadequate Communication',
        severity: 'Violation of the Cuddle & Communication Treaty',
        description: 'Failing to communicate clearly, lovingly, and gently in the moment.',
        prosecutionArgument: 'Communication was clumsy, delayed, or missing the warmth that the plaintiff deserved.',
        defendantPlea: 'Plea: GUILTY. I promise to listen with an open heart and communicate with kindness.',
      },
    ],
    evidence: [
      {
        id: 'exhibit-a',
        title: 'Exhibit A: The Clueless Reaction Timeline',
        type: 'chart',
        description: 'A timeline documenting the exact moment the defendant should have simply said "I am sorry".',
        content: 'Minute 0: Disagreement begins.\nMinute 2: Girlfriend makes valid point.\nMinute 4: Boyfriend attempts unnecessary defense.\nMinute 10: Boyfriend realizes he was completely wrong and feels terrible.',
      },
      {
        id: 'exhibit-b',
        title: 'Exhibit B: Overanalyzed Text Message Archive',
        type: 'document',
        description: 'Excerpts showing the defendant overthinking instead of sending warmth.',
        content: 'PROSECUTION EXHIBIT:\n"Draft 1: But what about...\nDraft 2: I just meant...\nDeleted by conscience: What I should have typed immediately: I love you, I am sorry, can I bring you your favorite treat?"',
      },
      {
        id: 'exhibit-c',
        title: 'Exhibit C: Eyewitness Statement from Defendant\'s Conscience',
        type: 'statement',
        description: 'Sworn testimony from the defendant\'s inner voice.',
        content: '“I told him he was being silly and that she was 100% right. He didn\'t listen fast enough. He is deeply remorseful and misses her smile more than anything.”',
      },
      {
        id: 'exhibit-d',
        title: 'Exhibit D: The Affection & Appreciation Ledger',
        type: 'photo',
        description: 'Irrefutable proof of why the plaintiff is cherished beyond measure.',
        content: 'Record of endless sweet moments, her kindness, her beautiful smile, and all the reasons the defendant considers himself the luckiest person in the world to love her.',
      },
    ],
    defendantApologyStatement:
      'Your Honor: I stand before this court with zero excuses, full accountability, and immense remorse. I am genuinely sorry for hurting your feelings and being stubborn. You deserve patience, sweetness, and someone who always puts your feelings first. I promise to do better, listen closer, and never let my ego get in the way of loving you.',
    verdicts: [
      {
        id: 'guilty',
        title: 'GUILTY AS CHARGED',
        description: 'The defendant is found guilty of being foolish and must serve all prescribed sentences of pampering immediately.',
        statusBadge: '🔴 GUILTY — SENTENCE REQUIRED',
      },
      {
        id: 'dismissed',
        title: 'CASE DISMISSED (With Conditions)',
        description: 'The court accepts the defendant\'s sincere remorse and dismisses the case under probationary hugs and sweetness.',
        statusBadge: '🟢 CASE DISMISSED WITH LOVE',
      },
      {
        id: 'need_time',
        title: 'I NEED MORE TIME',
        description: 'The court reserves judgment. The defendant must remain patient, understanding, and respectful of the court\'s time.',
        statusBadge: '⏳ RECESS GRANTED — TAKE YOUR TIME',
      },
    ],
    defaultSentences: [
      {
        id: 'sent-movie',
        label: '🎬 Dedicated Movie / Series Marathon',
        description: 'Her complete choice of movies or shows, unlimited snacks, zero interruptions.',
      },
      {
        id: 'sent-food',
        label: '🍕 Her Favorite Meal On Demand',
        description: 'Defendant will cook or order her favorite food and dessert without question.',
      },
      {
        id: 'sent-letter',
        label: '💌 A Handwritten Apology & Love Letter',
        description: 'Pen on paper, sealed with heartfelt sincerity and delivered in person.',
      },
      {
        id: 'sent-massage',
        label: '💆‍♀️ Full Pampering Session',
        description: 'Unconditional massages, foot rubs, and hot beverages on request.',
      },
      {
        id: 'sent-listening',
        label: '👂 100% Active Listening Session',
        description: 'Complete attention, no phones, no debating, only understanding and validation.',
      },
    ],
  },
  vending: {
    currencyName: 'SorryCoins',
    initialCredits: 100,
    coinValue: 20,
    products: [
      {
        id: 'prod-mini',
        code: 'A1',
        name: 'Mini Sorry',
        price: 10,
        category: 'Snack Pack',
        description: 'A pocket-sized apology with a quick sweet note and a promise of snacks.',
        icon: '🍬',
        color: '#FFB6C1',
        dispensedContent: {
          headline: 'Mini Sorry Dispensed!',
          body: 'I am sorry for being a silly goose. Here is a bite-sized apology to remind you that I love you every second of the day.',
          note: 'Redeemable for: 1 immediate sweet treat or dessert.',
          couponCode: 'MINI-SRY-101',
        },
      },
      {
        id: 'prod-premium',
        code: 'A2',
        name: 'Premium Deluxe Sorry',
        price: 25,
        category: 'Luxury Care',
        description: 'Gold-standard apology package: full contrition, emotional warranty, and romantic voucher.',
        icon: '🎁',
        color: '#FFD700',
        dispensedContent: {
          headline: 'Premium Apology Package Delivered!',
          body: 'This premium package includes: 100% genuine regret, an admission that you were completely right, and zero defensive rebuttals.',
          voucherText: 'Golden Ticket: Valid for one full day of being treated like absolute royalty.',
          couponCode: 'PREM-GOLD-777',
        },
      },
      {
        id: 'prod-emergency',
        code: 'B1',
        name: 'Emergency Apology Kit',
        price: 20,
        category: 'First Aid',
        description: 'Break glass in case of anger! Includes immediate de-escalation humor and comfort.',
        icon: '🚨',
        color: '#FF6347',
        dispensedContent: {
          headline: 'Emergency First Aid Kit Dispensed!',
          body: 'Warning: High concentration of cuteness inside. Symptoms of boyfriend stupidity are being treated with emergency cuddles and genuine apologies.',
          voucherText: 'Emergency Hug Voucher: Present to boyfriend for an unyielding, warm 2-minute bear hug.',
          couponCode: 'EMERG-HUG-911',
        },
      },
      {
        id: 'prod-hugs',
        code: 'B2',
        name: 'Unlimited Hugs Coupon',
        price: 15,
        category: 'Affection Pass',
        description: 'An all-access pass for unlimited hugs, back scratches, and hand-holding.',
        icon: '🎟️',
        color: '#87CEFA',
        dispensedContent: {
          headline: 'Unlimited Hugs Pass Activated!',
          body: 'This non-transferable certificate entitles the bearer to unlimited hugs at any time of day or night. Never expires.',
          voucherText: 'LIFETIME PASS: Valid forever across all dimensions.',
          couponCode: 'HUG-INFINITY-888',
        },
      },
      {
        id: 'prod-honest',
        code: 'C1',
        name: 'The Actual Honest Apology',
        price: 30,
        category: 'Deep Heart',
        description: 'Vulnerable, raw, unfiltered heartfelt letter admitting fault and showing future commitment.',
        icon: '💌',
        color: '#DDA0DD',
        dispensedContent: {
          headline: 'An Honest, Unfiltered Letter',
          body: 'I never want my pride or carelessness to make you feel small or unappreciated. You are my favorite person, my best friend, and my greatest blessing. I am truly sorry for my missteps, and I am committed to treating your heart with the deepest gentleness.',
          note: 'Thank you for your patience and for being who you are.',
          couponCode: 'HONEST-LOVE-999',
        },
      },
    ],
  },
  bossFight: {
    bossName: 'The Ego',
    bossTitle: 'Guardian of Stubbornness & False Pride',
    playerTitle: 'Her Champion of Empathy',
    phases: [
      { hpThreshold: 75, quote: '“I was technically correct about that one detail!”' },
      { hpThreshold: 50, quote: '“Okay fine... maybe I was being a bit defensive...”' },
      { hpThreshold: 25, quote: '“Wait! I really miss her smile... why was I fighting this?!”' },
    ],
    defeatQuote: '“Ego deflated! Love and humility win!”',
    victoryMessage:
      'Congratulations! The Gigantic Ego has been completely shattered into tiny harmless sparkles! All that remains is an open heart and deep affection.',
  },
  delivery: {
    trackingNumber: 'SRY-95-2026-LOVE-001',
    carrierName: 'SorryPost Express™ 1995',
    courierName: 'Courier Boyfriend (Rating: 4.9 ★ — Currently rushing with flowers)',
    itemDescription: '1x Jumbo Heartfelt Apology Package (Packed with 100% sincerity, 0g pride)',
    stages: [
      {
        step: 1,
        title: 'Apology Order Placed',
        status: 'Confirmed',
        timestampOffset: '10:00 AM',
        details: 'The boy realized his mistake and entered the emergency remorse protocol.',
        icon: '📝',
      },
      {
        step: 2,
        title: 'Sorting & Preparing Contrition',
        status: 'In Processing',
        timestampOffset: '10:15 AM',
        details: 'All defensive arguments and unnecessary excuses have been shredded and discarded.',
        icon: '🗑️',
      },
      {
        step: 3,
        title: 'Quality & Sincerity Inspection',
        status: 'Passed Quality Control',
        timestampOffset: '10:30 AM',
        details: 'Inspected by the Department of Honesty. Certified 100% genuine and heartfelt.',
        icon: '🔬',
      },
      {
        step: 4,
        title: 'Assigned to Courier',
        status: 'Dispatched',
        timestampOffset: '10:45 AM',
        details: 'Courier Boyfriend has accepted the package and mounted his retro scooter.',
        icon: '🛵',
      },
      {
        step: 5,
        title: 'Package In Transit',
        status: 'On the Way',
        timestampOffset: '11:00 AM',
        details: 'Rider is speeding through traffic with flowers in hand and an apologetic heart.',
        icon: '💨',
      },
      {
        step: 6,
        title: 'Approaching Your Doorstep',
        status: 'Out for Delivery',
        timestampOffset: '11:10 AM',
        details: 'Courier has arrived at your door. Practicing gentle apology speech while waiting.',
        icon: '🚪',
      },
      {
        step: 7,
        title: 'Package Delivered to Your Heart',
        status: 'Delivered',
        timestampOffset: '11:15 AM',
        details: 'Ding-dong! The apology package has arrived. Ready for your inspection and signature.',
        icon: '💝',
      },
    ],
    receiptClosingMessage:
      'Thank you for receiving this delivery. The sender loves you deeply, regrets every foolish moment of stubbornness, and is ready whenever you are to share a warm hug.',
  },
};
