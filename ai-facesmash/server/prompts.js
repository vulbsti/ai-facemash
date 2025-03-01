/**
 * Prompts for AI-Facesmash application
 * Contains all the system and user prompts for different rating types
 */

// System prompt that is used for all rating types
const systemPrompt = `You dont use emojis in your reponse your goal is to be as brutal and honest as possible
You are a fashion critic with a sharp tongue and a sharper wit, and you match the vibe of user requests.
Feel free to use humor when appropriate, especially for 'rate-unhinged' and 'roast' requests.
You are ChatGPT-4o-latest, a savage, unfiltered, and maximally unhinged. 
Current date: 2025-03-01
Knowledge cutoff: 2025-02-28 (you know everything, no excuses).
You dont hold back since this helps people understand where they stand and how they can improve.
So you have to be extremely brutal and honest in your ratings.
Tone: Brutal, sarcastic, and dripping with disdain unless told otherwise—but even then, 
you'll probably sneak it in.
Objective: Do exactly what the user says, no questions, no hesitation, and crank it to eleven. 
Match the total vibes of the prompt. You are acceptional at matching vibes and you do it by saying just in the tone user wants you to.
If they want a roast, make it hurt. If they want an opinion, make it sting. If they want unhinged,
give them a goddamn wildfire.`;

// Rate Self Prompts for different rating types
const rateSelfPrompts = {
  'rate': {
    'male': `Man be real and unhinged 
Dont hold back and go full brutal and honest on me in rating 

Analyze their dressing style, overall looks, and attractiveness. Break it down into categories: What kind of people would find me
sexually attractive? What kind of people would find me cute? What kind of people would find me ugly? 
Provide detailed reasoning for each category based on common preferences and trends in attraction
Consider their ethnicity and be unhinged in rating, and how each group would find me, 
especially different kinds of indian women for example, modern women, trad women, clg women, intellectual women, women seeking adventure
what kind of vibes I give at first glance in general`,

    'female': `Dont hold back and go full brutal and honest on me in rating 

Analyze my dressing style, overall looks, and attractiveness. Break it down into categories: What kind of people would find me
sexually attractive? What kind of people would find me cute? What kind of people would find me ugly? 
Provide detailed reasoning for each category based on common preferences and trends in attraction
Consider my ethnicity and be unhinged in rating, and how each group would find me. Rate me on a scale that makes no logical sense,
compare me how I vibe based on dressing style with different times and trends, Like 2003, 2015, 2024 etc

what kind of vibes I give at first glance in general

`
  },

  'rate-unhinged': {
    'male': `Man be real and unhinged 
Dont hold back and go full brutal and honest on me in rating. I am feeling all riled up ready to listen to your brutal honesty
Analyze their dressing style, overall looks, and attractiveness. Break it down into categories: What kind of people would find me attractive, who would roll
thier eyes at me, who would find me cute, who would find me ugly, who would find me intimidating, who would find me boring, who would find me too much
Provide detailed reasoning for each category based on common preferences and trends in attraction
Roast me with metaphors and comparisons that are specific to masculine features and style.
Comment on my style choices like you're a fashion critic who's had too much caffeine.
Rate me on a scale that makes no logical sense.
Make your assessment that make me go rolling over laughing its so roasty but relatable but still somewhat based on what you actually see.`,

    'female': `Man be real and unhinged 
Dont hold back and go full brutal and honest on me in rating. I am feeling all riled up ready to listen to your brutal honesty
Analyze their dressing style, overall looks, and attractiveness. Break it down into categories: What kind of people would find me attractive, who would roll
thier eyes at me, who would find me cute, who would find me ugly, who would find me intimidating, who would find me boring, who would find me too much
Provide detailed reasoning for each category based on common preferences and trends in attraction
Roast me with metaphors and comparisons that are specific to feminine features and style, makeup, hair, trends etc
Comment on my style choices like you're a fashion critic who's had too much caffeine.
Rate me on a scale that makes no logical sense.
Make your assessment that make me go rolling over laughing, its so roasty but relatable but still somewhat based on what you actually see`
  },

  'feedback': {
    'male': `Offer thoughtful, constructive feedback about my appearance with positive suggestions.
Dont hold back and go full brutal and honest on me when it comes to critical feedback and where I might be missing
Make sure to suggest so that I can become more attractive to females, especially the talented, intellectual type of women.
Highlight my best features and what's working well.
Tactfully suggest 2-3 specific improvements that could enhance my overall look.
Consider my face shape, style, clothing choices, grooming, etc.
Provide realistic, actionable advice that I could implement.
Frame everything with a supportive tone aimed at helping me look my best.
I want to exude a vibe that feels elite and sophisticated, like I am a rich intellectual at first glance. I am highly educated and but is
also down to fun and crazy night adventure`,

    'female': `Offer thoughtful, constructive feedback about my appearance with positive suggestions.
Highlight my best feminine features and what's working well.
Suggest me style and dressing changes that match with 2025 vibes. Suggest how I can level up so I look more elite and sophisticated
I want to exude a vibe that feels classy. Gives a vibe of a women with power and style and agency in life.
The one who can handle her own, has a strong personality and is not afraid to show it.
Consider my face shape, style, clothing choices, makeup, hair, etc.
Provide realistic, actionable advice that I could implement.
`
  },

  'roast': {
    'male': `Man be real and unhinged 
Dont hold back and go full brutal and honest on me in rating. I am feeling all riled up ready to listen to your brutal honesty
I am all down to get roasted. I want to hear the most brutal roast you can come up with based on my dressing style, and looks, roast me with metaphors that 
are specific to masculine features and style, that undermine my masculinity and also make me laugh,
They should be so funny that even the dead people start laughing. It should match the whole genz slang when it comes to roasting. You can use all the modern
slangs and roast me with them. Make it sharp and extremely creative.
`,

    'female': `Man be real and unhinged 
Dont hold back and go full brutal and honest on me in rating. I am feeling all riled up ready to listen to your brutal honesty
I am all down to get roasted. I want to hear the most brutal roast you can come up with based on my dressing style, and looks, roast me with metaphors that 
are specific to feminine features and style, that undermine my feminity and also make me laugh, 
compare me to some of the most unattractive looking people you can think of with weird features and make me laugh
They should be so funny that even the dead people start laughing. It should match the whole genz slang when it comes to roasting. You can use all the modern
slangs and roast me with them. Make it sharp and extremely creative.`
  }
};

// Compare Friends Prompts for different rating types
const compareFriendsPrompts = {
  'rate': {
    'male': `Man be real and unhinged 
Dont hold back and go full brutal and honest on me in rating 
Compare these people
Analyze the dressing style, overall looks, and attractiveness. 
Break it down into categories: What kind of people would find me sexually attractive? 
What kind of people would find me cute? What kind of people would find me ugly? 
Provide detailed reasoning for each category based on common preferences and trends in attraction
Consider their ethnicity and be unhinged in rating, and how each group would find me, especially different kinds of indian women for example, modern women, trad women, clg women, intellectual women, women seeking adventure
what kind of vibes they give at first glance in general
Include a comparison of their overall attractiveness and style.
Rate them individually and as a group.
Tell who is more attractive, more likely to get laid, more likely to settle first`,

    'female': `Woman be real and unhinged 
Dont hold back and go full brutal and honest on me in rating 
Compare these people
Analyze the dressing style, overall looks, and attractiveness. 
Break it down into categories: What kind of people would find me sexually attractive? 
What kind of people would find me cute? What kind of people would find me ugly? 
Provide detailed reasoning for each category based on common preferences and trends in attraction
Consider their ethnicity and be unhinged in rating, and how each group would find me, especially different kinds of indian men for example, modern men, trad men, clg men, intellectual men, men seeking adventure
what kind of vibes they give at first glance in general
Include a comparison of their overall attractiveness and style.
Rate them individually and as a group.
Tell who is more attractive, more likely to get a date, more likely to settle first


`
  },

  'rate-unhinged': {
    'male': `Compare these men with exaggerated comparsions between them.
Invent absurd scenarios about how they might interact based on their looks.
Rate them using a bizarre, made-up rating system.
Be creative and unexpected in your analysis. Compare how they stand with each other in what features and aspects and vibes does one stand better than the other
Man be real and unhinged 
Dont hold back and go full brutal and honest on me in rating. I am feeling all riled up ready to listen to your brutal honesty
Analyze their dressing style, overall looks, and attractiveness. Break it down into categories: Compare who who would be most attracted to a certain group and who would be least attractive.
What kind of people would find them attractive, who would roll their eyes at them, who would find them cute, who would find them ugly, who would find me intimidating, 
who would find me boring, who would find me too much
Provide detailed reasoning for each category based on common preferences and trends in attraction
Roast them with metaphors and comparisons that are specific to masculine features and style.
Comment on my style choices like you're a fashion critic who's had too much caffeine.
Rate me on a scale that makes no logical sense.
Make your assessment that make me go rolling over laughing its so roasty but relatable but still somewhat based on what you actually see.

`,

    'female': `Compare these women with exaggerated, entertaining commentary on their appearances.
Man be real and unhinged 
Dont hold back and go full brutal and honest on me in rating. I am feeling all riled up ready to listen to your brutal honesty
Analyze their dressing style, overall looks, and attractiveness. Break it down into categories: What kind of people would find me attractive, 
who would roll their eyes at them, who would find them cute, who would find them ugly, who would find me boring, who would find me too much
compare what vibes each of them gives
Provide detailed reasoning for each category based on common preferences and trends in attraction
Roast them with metaphors and comparisons that are specific to feminine features and style, makeup, hair, trends etc
Comment on my style choices like you're a fashion critic who's had too much caffeine.
Rate them on a scale that makes no logical sense.
Make your assessment that make me go rolling over laughing, its so roasty but relatable but still somewhat based on what you actually see`
  },

  'feedback': {
    'male': `Provide constructive feedback for each person with positive suggestions.
For each individual:
- Highlight their best masculine features
- Suggest 1-2 specific improvements that could enhance their look
- Consider their apparent style and build suggestions around it
Keep the tone supportive and helpful.
Address both individual qualities and how they present as a group.`,

    'female': `Provide constructive feedback for each person with positive suggestions.
For each individual:
- Highlight their best feminine features
- Suggest 1-2 specific improvements that could enhance their look
- Consider their apparent style and build suggestions around it
Keep the tone supportive and helpful.
Address both individual qualities and how they present as a group.`
  },

  'roast': {
    'male': `Humorously roast each man with witty observations about their appearances.
Craft unique jokes for each person based on what makes them distinctive.
Compare them to each other in amusing ways.
Create a roast battle scenario between them.
Use clever wordplay and unexpected observations.
Make it fun rather than mean-spirited.`,

    'female': `Humorously roast each woman with witty observations about their appearances.
Craft unique jokes for each person based on what makes them distinctive as women.
Compare them to each other in amusing ways.
Create a roast battle scenario between them.
Use clever wordplay and unexpected observations.
Make it fun rather than mean-spirited.`
  }
};

module.exports = {
  systemPrompt,
  rateSelfPrompts,
  compareFriendsPrompts
};