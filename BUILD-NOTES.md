# Build notes: TeamSync

A team task and points tracker: Google sign-in, tasks, a leaderboard, Firebase Auth and Firestore. Built in Google AI Studio's Build mode. This is project 3 of 5 in my [AI Studio build notes](https://github.com/YenXenshi/ai-studio-build-notes), where the full write-up lives.

This is an independent project, not made or endorsed by Google. Notes are from 2026-11-04, 2026-11-05 and 2026-11-07.

## What I'm working on here
Adding a login and a real database, and learning where the generated code and the generated rules disagree.

## What broke, and how it got fixed
1. The "view as guest" leaderboard link could never work. The generated rules deny reads to signed-out visitors, so the page was empty.
2. The task list stayed empty after sign-in until I reloaded. A smallest-fix prompt re-attached the live listeners on sign-in and sign-out. The retest passed.

## What I tested
Google sign-in, add task, mark done and points, reload persistence, and the leaderboard (six scores summed to the total). Fresh clone: builds and the sign-in screen loads.

## Security notes (read from `firestore.rules`, NOT attack-tested)
- Any signed-in user can read every user record and every task.
- Points are a number the browser writes, so a signed-in user could likely give themselves any points.
- The `isSample` flag skips the owner check, so any signed-in user could likely create or change other people's tasks.
- A real fix would calculate points on the server and tighten these rules. I have not built or tested that.

## What I learned
"It saved" and "the screen updated" are different. Read the rules file, because the AI's summary of the rules is not the rules.

## NOT tested
Two people signed in at once, Team Feed, filters, day rollover, deleting, and attacking the rules.

## Running it
`firebase-applet-config.json` has placeholder values. Add your own Firebase project and deploy `firestore.rules`. Use `npm install --legacy-peer-deps`, then `npm run dev` (tested on Node 22).
