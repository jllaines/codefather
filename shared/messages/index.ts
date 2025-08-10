import { GitUser, MessageOptions, MessageType } from "@shared/models";

const sharedSuccess = [
  "✓ _committers_, you handled the code with respect. The family is proud.",
  "✓ _committers_, you honored the business. That’s how trust is built.",
  "✓ _committers_: You made your bones with this one.",
  "✓ _committers_: Code like this keeps the peace in the family.",
  "✓ _committers_, you handled your business quietly. The family respects discretion.",
  "✓ _committers_: That’s how professionals operate. You moved smart, you moved clean.",
  "✓ _committers_: You didn’t just commit, you showed class.",
  "✓ _committers_: Good code, good manners, good reputation.",
  "✓ _committers_, your respect for the code speaks louder than a thousand pull requests.",
  "✓ _committers_: You moved with honor. You’re earning your place at my table.",
  "✓ _committers_, there’s no fanfare for doing it right—but I noticed how you behave.",
  "✓ _committers_: This code needs no apology. That's rare.",
  "✓ _committers_, that’s not just a commit… it’s a tribute to our rules.",
  "✓ _committers_: If only all developers had your instincts.",
  "✓ _committers_: You touched the code and made it better. That's art.",
  "✓ _committers_, you've earned silence. I don't critique perfection.",
  "✓ _committers_: You walked in, did your job, and left no trace. That’s respect.",
  "✓ _committers_, this code smells like loyalty.",
  "✓ _committers_: Quiet hands. Clean commit. No questions.",
  "✓ _committers_, you just raised the bar. Be careful, others might trip over it.",
  "✓ _committers_: Even my consigliere asked who wrote that one.",
];

const sharedErrors = [
  "𐄂 _committers_: Look how you massacred my code... Contact _goodfellas_ and make amend.",
  "𐄂 _committers_: You will sleep with the fishes! Don't touch this part! Get in touch with _goodfellas_ to arrange things.",
  "𐄂 _committers_: This ain't how we do things. Talk to _goodfellas_ before there's a sit-down.",
  "𐄂 _committers_: You crossed a line. Only _goodfellas_ can fix this mess.",
  "𐄂 _committers_: Unauthorized moves like that? I'm very disappointed.",
  "𐄂 _committers_: You broke the rules. That’s not how this family operates.",
  "𐄂 _committers_: You acted solo. This thing of ours? It's built on trust. Get _goodfellas_ involved.",
  "𐄂 _committers_: You broke sacred ground. Only _goodfellas_ can grant access.",
  "𐄂 _committers_: I saw the commit… I ain't smiling. Speak with _goodfellas_.",
  "𐄂 _committers_: Mistakes like these leave bodies in the file history. Get it cleared with _goodfellas_.",
  "𐄂 _committers_: You stepped on protected turf. You want forgiveness? Start with _goodfellas_.",
  "𐄂 _committers_, you took a liberty that wasn't yours. Talk to _goodfellas_ before things escalate.",
  "𐄂 _committers_: You moved without permission. This isn’t amateur hour.",
  "𐄂 _committers_, the code isn't yours to break. _goodfellas_ handle this part.",
  "𐄂 _committers_: You crossed the line. Now you owe the Family a conversation.",
  "𐄂 _committers_, disrespect is easy. Fixing it? That’s a job for _goodfellas_.",
  "𐄂 _committers_: You made a move without my blessing. Never wise.",
  "𐄂 _committers_, you broke a rule and you broke trust. _goodfellas_ can guide you back.",
  "𐄂 _committers_, touch a sacred file and you better bring permission.",
  "𐄂 _committers_, your fingerprint's on a forbidden section. Better clean it up with _goodfellas_.",
  "𐄂 _committers_: There are rules for a reason. Get _goodfellas_ involved before this becomes a problem.",
  "𐄂 _committers_: You messed with the wrong files.",
  "𐄂 _committers_: That commit screams betrayal. _goodfellas_ heard it loud and clear.",
  "𐄂 _committers_: You broke something built on trust. Now it needs fixing.",
  "𐄂 _committers_, this act smells like ambition. Careful—ambition got Fredo killed.",
  "𐄂 _committers_: You acted like a enemy. We don’t deal with enemies.",
  "𐄂 _committers_: That move lacked honor. Fix it or fade out.",
  "𐄂 _committers_: You weren’t subtle. You weren’t careful. Call _goodfella_ to clear things out.",
];

const messagesMap: Record<MessageType, string[]> = {
  [MessageType.Success]: [
    "✓ Thank you _committers_. You respected the codebase.",
    "✓ Grazie mille, _committers_! You're a honorable developer.",
    "✓ _committers_: You respected the limits. Your friendship is greatly appreciated.",
    "✓ _committers_: You're a stand-up developer. Loyalty like this doesn't go unnoticed.",
    "✓ _committers_, this commit is art. You’ve earned your cannoli.",
    ...sharedSuccess,
  ],
  [MessageType.MultiSuccess]: [
    "✓ Thank you _committers_. You respected the codebase.",
    "✓ Grazie mille, _committers_! You're honorable developers.",
    "✓ _committers_: You respected the limits. Youre friendship is greatly appreciated.",
    "✓ _committers_: You're stand-up developers. Loyalty like that doesn't go unnoticed.",
    "✓ _committers_, this commit is art. You’ve earned your cannolis.",
    ...sharedSuccess,
  ],
  [MessageType.Error]: [
    "𐄂 _committers_! You need permission from my trusted associate: _goodfellas_. Nobody touches this without approval.",
    "𐄂 _committers_: You messed up. Big. _goodfellas_ is already talking.",
    ...sharedErrors,
  ],
  [MessageType.MultiErrors]: [
    "𐄂 _committers_! You need permission from my trusted associates: _goodfellas_. Nobody touches this without approval.",
    "𐄂 _committers_: You messed up. Big. _goodfellas_ are already talking.",
    ...sharedErrors,
  ],
  [MessageType.Warning]: [
    "⚠ _committers_: You ain't made, but we’ll let it slide this time. Get _goodfellas_ to vouch for ya.",
    "⚠ _committers_: Be cautious if you don't want to get whacked... Contact _goodfellas_ to clear things out.",
    "⚠ _committers_: You get a pass this time, but don't push it. Get in touch _goodfellas_ and you'll be alright.",
    "⚠ _committers_: You danced too close to the edge. Get _goodfellas_ to keep you in the circle.",
    "⚠ _committers_: You’re walking a fine line… _goodfellas_ might have your back.",
    "⚠ _committers_: You pulled a risky move. Lucky for you, it’s just a warning. Consult _goodfellas_.",
    "⚠ _committers_: One more slip and it’s concrete shoes. Chat with _goodfellas_ first.",
    "⚠ _committers_: You're not made yet. Show respect—talk to _goodfellas_.",
    "⚠ _committers_: I'm watching you. Walk the line and speak to _goodfellas_.",
    "⚠ _committers_: You skirted the rules. Make peace with _goodfellas_ before the next job.",
    "⚠ _committers_: Careful… Loyalty is proven, not assumed. _goodfellas_ can guide you.",
    "⚠ _committers_: Almost crossed the line. Best check with _goodfellas_ next time.",
    "⚠ _committers_: You're not in trouble… yet. _goodfellas_ can keep it that way.",
    "⚠ _committers_: One toe over the line. _goodfellas_ can help you get back.",
    "⚠ _committers_, you bent the rules. Just don’t break them.",
    "⚠ _committers_: You slipped once. That’s all you get.",
    "⚠ _committers_: Your code raised a brow. Next time, _goodfellas_ better be in the room.",
    "⚠ _committers_, almost took a wrong turn. _goodfellas_ know the right way.",
    "⚠ _committers_: You grazed the edge. Next time, show respect.",
    "⚠ _committers_: You’re walking a thin line. Watch your step.",
    "⚠ _committers_, you touched sensitive ground. The Don expects caution.",
    "⚠ _committers_: We’re watching. Keep it clean and consult _goodfellas_.",
    "⚠ _committers_: The rules were tested... but not broken. Don't test them again.",
    "⚠ _committers_: You flirted with danger. But I don't flirt back.",
    "⚠ _committers_: Careful. That path leads to 'meeting in a warehouse' territory.",
    "⚠ _committers_: You touched something you shouldn’t. The Family is watching.",
    "⚠ _committers_: Not a full betrayal... but you danced too close.",
    "⚠ _committers_: You’re whispering around rules. They don’t whisper back.",
    "⚠ _committers_: One more move like that and you’ll need a favor. We don’t like favors.",
    "⚠ _committers_: You've entered a gray zone. Hope you brought a flashlight—and permission.",
  ],
  [MessageType.NoChanges]: [
    "✓ You haven't modified a single file, _committers_. It's nice to be low-key, but one day, you gotta take action.",
    "✓ Tutto bene, _committers_. No suspicious activity detected.",
    "✓ _committers_, you kept your hands clean… This time.",
    "✓ No files touched, _committers_. The silence is noted.",
    "✓ _committers_: You walked in, made no noise, left without a trace. Respect.",
    "✓ _committers_, sometimes doing nothing is the smartest move. Sometimes.",
    "✓ _committers_: You didn’t touch a thing. Makes me wonder what you're planning.",
    "✓ No activity detected, _committers_. Either you're careful, or you're lazy.",
    "✓ _committers_, staying under the radar, huh? Just don’t make it a habit.",
    "✓ _committers_: I’ve seen quieter nights... but not many.",
    "✓ _committers_: No footprints, no fingerprints. You’re either clean or hiding something.",
    "✓ _committers_, you moved like a ghost. But ghosts don’t write good code.",
    "✓ _committers_, the files sleep undisturbed. You know the value of silence.",
    "✓ _committers_: Nothing changed, but I see your discipline.",
    "✓ _committers_: Sometimes doing nothing is wisdom. Today was one of those times.",
    "✓ _committers_, the files are untouched—but your reputation isn’t.",
    "✓ _committers_: You showed restraint. I respect restraint.",
  ],
  [MessageType.NotFound]: [
    "𐄂 The codefather.ts file doesn't exist. Maybe someone whacked it?",
  ],
  [MessageType.NoGitConfig]: [
    "𐄂 You don't have a git config... Are you a cop?",
  ],
};

function formatUserList(users: GitUser[], type: Intl.ListFormatType): string {
  const usernames = [
    ...new Set(users.map(({ name }) => name?.trim()).filter(Boolean)),
  ] as string[];

  return new Intl.ListFormat("en", {
    style: "long",
    type,
  }).format(usernames);
}

function getMessageType(
  type: MessageType,
  options: MessageOptions = {}
): MessageType {
  const { committers = [], goodfellas = [] } = options;
  if (type === MessageType.Success) {
    if (committers?.length > 1) return MessageType.MultiSuccess;
  }
  if (type === MessageType.Error) {
    if (goodfellas?.length > 1) return MessageType.MultiErrors;
  }
  return type;
}

export function getRandomMessage(
  type: MessageType,
  options: MessageOptions = {}
): string {
  const validMessageType = getMessageType(type, options);
  const messages = messagesMap[validMessageType];
  let message = messages[Math.floor(Math.random() * messages.length)];
  if (options.goodfellas) {
    const goodfellasList = formatUserList(options.goodfellas, "disjunction");
    const validGoodfellas = goodfellasList || "a goodfella";
    message = message.replace("_goodfellas_", validGoodfellas);
  }
  if (options.committers) {
    const committersList = formatUserList(options.committers, "conjunction");
    const validCommitters = committersList || "Committer";
    message = message.replace("_committers_", validCommitters);
  }
  return message
    .replace(/_committers_/g, "Committer")
    .replace(/_goodfellas_/g, "a goodfella")
    .replace(/\s+/g, " ") // remove newlines and multiple spaces
    .trim()
    .replace(/^./, (m) => m.toUpperCase());
}
