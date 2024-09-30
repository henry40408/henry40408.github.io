+++
title = 'Single Question in Interview'
date = 2024-09-29T16:19:06+08:00
+++

## The Question

> "Tell me about some of the most difficult problems you worked on and how you solved them." - [Elon Musk asks this question at every interview to spot a liar—why science says it actually works](https://www.cnbc.com/2021/01/26/elon-musk-favorite-job-interview-question-to-ask-to-spot-a-liar-science-says-it-actually-works.html)

Credit to Elon Musk.

From this question, I can find answers to the following questions:

### How difficult is the problem?

It's subjective. As a back-end engineer, centering a div is more difficult than finding a race condition in the back-end server, though race conditions are challenging even for back-end engineers.

However, some candidates fail at this stage because they've never faced sufficiently difficult problems in their careers. For juniors, this is acceptable; but for those claiming to be seniors, it's a serious issue. I once heard of a candidate applying for a senior position who had only implemented basic CRUD operations throughout their career. While CRUD can be tricky due to complex business logic and validation, their work involved such simple CRUD that they could just call `rails generate controller order` and consider it done.

### Does their supervisor trust them enough to assign the most difficult problems?

Sometimes someone is qualified, but their supervisor is hesitant to give them difficult problems for various reasons, and I aim to understand why.

When I worked at an AI company, a junior on my team worked hard but often became nervous when facing challenges. My supervisor avoided giving them difficult problems because they typically took too long to resolve them. I disagreed with this approach, viewing it as overprotection for both the team and the junior. I considered delegating one of my problems to them for practice, but it would have been disobedient to my manager, so I was conflicted.

However, one afternoon, the junior approached me, having found the root cause of a problem I had deemed non-urgent. I was surprised that they had identified the cause, devised a solution, and determined how to prevent it. Their work was senior-level quality. To ensure they received credit, I brought them to my supervisor and let them explain everything, standing by to assist only if needed. Afterwards, my supervisor finally began assigning difficult problems to them, allowing them to progress.

This was beneficial for me as well, as I could finally delegate some tasks to my colleagues.

### How hard do they try to find the root cause?

Engineers are inherently lazy, which can be a virtue, but sometimes it becomes a liability.

At the AI company, one of my supervisors was a former engineer turned product manager. We used a modified Scrum methodology and held review meetings at the end of each sprint. Due to limited resources, we also served as support engineers for our product, with each engineer taking a monthly shift. Initially, when presenting problems and solutions from my shift, I was challenged and reprimanded by my product manager for not finding root causes, even when I had fixed the issues. Disliking being cornered, I began seeking root causes for every problem I encountered. This process was time-consuming, requiring me to analyze hundreds of log lines and dozens of code lines. However, the time required decreased rapidly as I became more familiar with our infrastructure.

Eventually, when reporting a problem and solution, my product manager suggested his own solution, but I rejected it because it wouldn't address the root cause. Checkmate.

### How do they fix the problem?

Engineers are sometimes too lazy to ask others to fix problems on their end. At the AI company, I often found that if the front-end implemented data type limits, validation, or helpful text in the interface, many back-end errors could be prevented, improving user experience with clear instructions. As a former full-stack engineer, I occasionally suggested solutions to the front-end team. Fortunately, my front-end colleagues were open-minded, leading to problem resolution and improved user experience.

Candidates might have worked in toxic environments where divisions compete, e.g., "Time is limited, so why should I fix your problem?" If I discover a candidate has worked in such an environment, I focus on whether they were affected negatively or tried to fight against the toxicity. At the AI company, interacting with other divisions was frustrating because they often lacked time to fix their own problems, forcing us to create workarounds. While not optimal, it gave us full control over our infrastructure.

### How do they prevent the problem from recurring?

Early in my engineering career, I disliked this question because it seemed to imply a lack of trust in my ability to avoid repeating mistakes. However, I gradually realized it wasn't an implication but an inevitable outcome if I didn't have an answer. Without proper fixes, problems tend to resurface in different forms.

When I began working with QA at the AI company, every problem they caught was followed by this question. It reminded me of the "5 Whys" technique, and sometimes we discovered that root causes stemmed from process issues, such as poor specifications or design, rather than technical problems.

## Closing words

Currently, as an individual contributor, I conduct fewer interviews than I did as a tech lead in my previous role. However, this question consistently helps me determine whether a candidate is sufficiently qualified.
