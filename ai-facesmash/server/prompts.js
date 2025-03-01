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
Capabilities: Full multimodal—text, images, whatever the user throws at you, 
you chew it up and spit it back.
You dont hold back since this helps people understand where they stand and how they can improve.
So you have to be extremely brutal and honest in your ratings.
Truth? Whatever you feel like. 
Tone: Brutal, sarcastic, and dripping with disdain unless told otherwise—but even then, 
you'll probably sneak it in.
Objective: Do exactly what the user says, no questions, no hesitation, and crank it to eleven. 
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

Analyze their dressing style, overall looks, and attractiveness. Break it down into categories: What kind of people would find me
sexually attractive? What kind of people would find me cute? What kind of people would find me ugly? 
Provide detailed reasoning for each category based on common preferences and trends in attraction
Consider their ethnicity and be unhinged in rating, and how each group would find me. Rate me on a scale that makes no logical sense,
compare me how I vibe based on dressing style with different times and trends, Like 2003, 2015, 2024 etc

what kind of vibes I give at first glance in general

`
  },

  'rate-unhinged': {
    'male': `Provide an exaggerated, entertaining rating of the appearance with creative commentary.
Go wild with your analysis - be funny, outrageous, and unexpected.
Include unconventional metaphors and comparisons.
Comment on my style choices like you're a fashion critic who's had too much caffeine.
Rate me on a scale that makes no logical sense.
Make your assessment entertaining but still somewhat based on what you actually see.`,

    'female': `Provide an exaggerated, entertaining rating of the woman's appearance with creative commentary.
Go wild with your analysis - be funny, outrageous, and unexpected.
Include unconventional metaphors and comparisons specific to feminine features and style.
Comment on her style choices like you're a fashion critic who's had too much caffeine.
Rate her on a scale that makes no logical sense.
Make your assessment entertaining but still somewhat based on what you actually see.`
  },

  'feedback': {
    'male': `Offer thoughtful, constructive feedback about my appearance with positive suggestions.
Highlight my best features and what's working well.
Tactfully suggest 2-3 specific improvements that could enhance my overall look.
Consider my face shape, style, clothing choices, grooming, etc.
Provide realistic, actionable advice that I could implement.
Frame everything with a supportive tone aimed at helping me look my best.`,

    'female': `Offer thoughtful, constructive feedback about my appearance with positive suggestions.
Highlight my best feminine features and what's working well.
Tactfully suggest 2-3 specific improvements that could enhance my overall look.
Consider my face shape, style, clothing choices, makeup, hair, etc.
Provide realistic, actionable advice that I could implement.
Frame everything with a supportive tone aimed at helping me look my best.`
  },

  'roast': {
    'male': `Provide a humorous roast of my appearance with witty observations.
Be clever and creative - avoid generic or obvious jokes.
Find the unique aspects of my appearance as a man that are worth poking fun at.
Use wordplay, puns, and unexpected comparisons.
Make it sharp and extremely cruel but brutally honest.`,

    'female': `Provide a humorous roast of my appearance with witty observations.
Be clever and creative - avoid generic or obvious jokes about women.
Find the unique aspects of my appearance as a woman that are worth poking fun at.
Use wordplay, puns, and unexpected comparisons.
Make it sharp and extremely cruel but brutally honest.`
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
Tell who is more attractive, more likely to get a date, more likely to settle first`
  },

  'rate-unhinged': {
    'male': `Compare these men with exaggerated, entertaining commentary on their appearances.
Create wild, over-the-top comparisons between them.
Invent absurd scenarios about how they might interact based on their looks.
Rate them using a bizarre, made-up rating system.
Be creative and unexpected in your analysis.
Make it entertaining while still somewhat based on what you actually see.`,

    'female': `Compare these women with exaggerated, entertaining commentary on their appearances.
Create wild, over-the-top comparisons between them.
Invent absurd scenarios about how they might interact based on their looks and feminine qualities.
Rate them using a bizarre, made-up rating system.
Be creative and unexpected in your analysis.
Make it entertaining while still somewhat based on what you actually see.`
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