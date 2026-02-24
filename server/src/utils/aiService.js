/**
 * AI Service: Uses OpenAI if OPENAI_API_KEY is set, otherwise returns rich mock feedback.
 */

let openai = null;
if (process.env.OPENAI_API_KEY) {
  try {
    const { OpenAI } = require('openai');
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (e) {
    console.warn('OpenAI module not available, using mock AI service');
  }
}

const callOpenAI = async (systemPrompt, userPrompt, maxTokens = 600) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
  });
  return response.choices[0].message.content.trim();
};

// ─── Code Feedback ────────────────────────────────────────────────────────────

const getCodeFeedback = async ({ code, language, questionTitle, status, testCasesPassed, totalTestCases }) => {
  if (openai) {
    const systemPrompt = `You are an expert coding interviewer and code reviewer. Provide concise, actionable feedback on submitted code. Focus on correctness, time/space complexity, code quality, and best practices.`;
    const userPrompt = `Question: ${questionTitle}
Language: ${language}
Status: ${status} (${testCasesPassed}/${totalTestCases} test cases passed)
Code:
\`\`\`${language}
${code}
\`\`\`
Provide structured feedback with: 1) What's correct 2) Issues found 3) Complexity analysis 4) Improvement suggestions`;
    return callOpenAI(systemPrompt, userPrompt);
  }
  return generateMockCodeFeedback({ code, language, status, testCasesPassed, totalTestCases });
};

const generateMockCodeFeedback = ({ code, language, status, testCasesPassed, totalTestCases }) => {
  const ratio = totalTestCases > 0 ? testCasesPassed / totalTestCases : 0;
  const lines = code.split('\n').length;
  const hasComments = code.includes('//') || code.includes('#') || code.includes('/*');
  const hasLoop = /for|while/.test(code);
  const hasRecursion = /function.*{[\s\S]*?\1/i.test(code) || code.includes('return ') && code.includes('(n');

  let feedback = '';

  if (status === 'Accepted') {
    feedback += `✅ **Great job! Your solution is accepted.**\n\n`;
    feedback += `**Strengths:**\n`;
    feedback += `- Solution produces correct output for all ${totalTestCases} test cases\n`;
    feedback += `- Code is ${lines < 20 ? 'concise and readable' : 'comprehensive'}\n`;
    if (hasComments) feedback += `- Good use of comments for clarity\n`;

    feedback += `\n**Complexity Analysis:**\n`;
    if (hasLoop && hasRecursion) {
      feedback += `- Time Complexity: O(n log n) - estimated based on recursive+iterative pattern\n`;
    } else if (hasLoop) {
      feedback += `- Time Complexity: O(n) - linear traversal detected\n`;
    } else {
      feedback += `- Time Complexity: O(1) or O(n) - depends on built-in operations used\n`;
    }
    feedback += `- Space Complexity: O(n) - consider if in-place optimization is possible\n`;

    feedback += `\n**Suggestions for improvement:**\n`;
    feedback += `- Consider edge cases: empty input, single element, negative numbers\n`;
    feedback += `- Add input validation for production code\n`;
    if (language === 'javascript') feedback += `- Consider using TypeScript for better type safety\n`;
    if (language === 'python') feedback += `- Add type hints for better readability (e.g., def solve(nums: List[int]) -> int)\n`;
  } else if (ratio >= 0.5) {
    feedback += `⚠️ **Partial solution - ${testCasesPassed}/${totalTestCases} test cases passed.**\n\n`;
    feedback += `**What's working:**\n`;
    feedback += `- Core logic appears to be on the right track\n`;
    feedback += `- Basic cases are handled correctly\n\n`;
    feedback += `**Likely issues:**\n`;
    feedback += `- Edge cases may not be handled (empty arrays, null values, overflow)\n`;
    feedback += `- Off-by-one errors in loop boundaries\n`;
    feedback += `- Check your return statement covers all code paths\n\n`;
    feedback += `**Next steps:**\n`;
    feedback += `- Trace through the failing test cases manually\n`;
    feedback += `- Add boundary checks at the start of your function\n`;
    feedback += `- Consider using a two-pointer or sliding window approach if applicable\n`;
  } else {
    feedback += `❌ **Solution needs significant revision.**\n\n`;
    feedback += `**Issues detected:**\n`;
    feedback += `- The algorithm logic needs rethinking\n`;
    feedback += `- Most test cases are failing - check your understanding of the problem\n\n`;
    feedback += `**Approach suggestions:**\n`;
    feedback += `- Re-read the problem statement carefully\n`;
    feedback += `- Start with a brute force solution, then optimize\n`;
    feedback += `- Draw out the problem with example inputs\n`;
    feedback += `- Consider: hash maps for O(1) lookups, sorting for ordered operations, BFS/DFS for graph problems\n\n`;
    feedback += `**Resources:**\n`;
    feedback += `- Review the hints provided with the question\n`;
    feedback += `- Study similar problems in the question bank\n`;
  }

  return feedback;
};

// ─── Resume Analysis ──────────────────────────────────────────────────────────

const analyzeResume = async (resumeText) => {
  if (openai) {
    const systemPrompt = `You are an expert HR consultant and technical recruiter with 10+ years of experience. Analyze resumes and provide detailed, actionable feedback.`;
    const userPrompt = `Analyze this resume and provide:
1. Overall score (out of 100)
2. Key strengths (3-5 points)
3. Areas for improvement (3-5 points)
4. ATS optimization tips
5. Missing keywords for tech roles
6. Recommended skills to add

Resume:
${resumeText.substring(0, 3000)}`;
    return callOpenAI(systemPrompt, userPrompt, 800);
  }
  return generateMockResumeAnalysis(resumeText);
};

const generateMockResumeAnalysis = (resumeText) => {
  const wordCount = resumeText.split(/\s+/).length;
  const hasGithub = /github/i.test(resumeText);
  const hasLinkedIn = /linkedin/i.test(resumeText);
  const hasTechSkills = /javascript|python|java|react|node|aws|docker|kubernetes/i.test(resumeText);
  const hasEducation = /bachelor|master|b\.tech|m\.tech|degree|university|college/i.test(resumeText);
  const hasExperience = /experience|intern|engineer|developer|manager/i.test(resumeText);
  const hasProjects = /project|built|developed|created|implemented/i.test(resumeText);

  let score = 50;
  if (hasGithub) score += 5;
  if (hasLinkedIn) score += 5;
  if (hasTechSkills) score += 10;
  if (hasEducation) score += 10;
  if (hasExperience) score += 10;
  if (hasProjects) score += 10;
  if (wordCount > 200 && wordCount < 700) score += 5; // ideal length
  score = Math.min(score, 95);

  return `📄 **Resume Analysis Report**

**Overall Score: ${score}/100**

**✅ Strengths:**
${hasExperience ? '- Strong work experience section with relevant roles\n' : '- Shows initiative and potential\n'
}${hasTechSkills ? '- Good technical skills coverage\n' : '- Clear presentation of qualifications\n'
}${hasProjects ? '- Projects demonstrate practical application of skills\n' : ''
}${hasGithub ? '- GitHub profile linked (great for visibility)\n' : ''
}${hasEducation ? '- Educational background clearly presented\n' : ''}

**⚠️ Areas for Improvement:**
${!hasGithub ? '- Add a GitHub profile link to showcase your code\n' : ''
}${!hasLinkedIn ? '- Include your LinkedIn profile URL\n' : ''
}${wordCount < 200 ? '- Resume is too brief; expand on your experiences and achievements\n' : wordCount > 700 ? '- Resume may be too long; consider condensing to 1-2 pages\n' : ''
}- Use more quantifiable achievements (e.g., "Improved performance by 40%")
- Add a concise professional summary at the top

**🤖 ATS Optimization Tips:**
- Use standard section headings (Experience, Education, Skills)
- Avoid tables, columns, and graphics in the main content
- Include keywords from job descriptions you're targeting
- Use both acronyms and full forms (e.g., "ML (Machine Learning)")

**🔑 Recommended Keywords to Add:**
- Agile/Scrum methodology
- CI/CD pipelines
- RESTful APIs
- System design
- Data structures & algorithms
- ${hasTechSkills ? 'Cloud platforms (AWS/GCP/Azure)' : 'Core programming languages (Python, JavaScript, Java)'}

**📈 Recommended Skills to Highlight:**
- Problem-solving and analytical thinking
- Version control (Git/GitHub)
- Testing and debugging
- Communication and teamwork`;
};

// ─── Interview Tips ───────────────────────────────────────────────────────────

const getInterviewTip = async (topic) => {
  if (openai) {
    const systemPrompt = `You are an expert interview coach specializing in technical and behavioral interviews for software engineering roles.`;
    const userPrompt = `Give me comprehensive interview tips for the topic: "${topic}". Include:
1. Key concepts to master
2. Common interview questions on this topic
3. How to structure your answer
4. Common mistakes to avoid
5. A sample strong answer`;
    return callOpenAI(systemPrompt, userPrompt, 700);
  }
  return generateMockInterviewTip(topic);
};

const generateMockInterviewTip = (topic) => {
  const tips = {
    arrays: `**Arrays Interview Tips**\n\n**Key Concepts:** Two pointers, sliding window, prefix sums, binary search\n\n**Common Questions:** Two Sum, Maximum Subarray, Rotate Array, Merge Sorted Arrays\n\n**Answer Structure:** State approach → Walk through example → Code → Analyze complexity\n\n**Avoid:** Modifying array while iterating, forgetting edge cases (empty, single element)\n\n**Sample:** For "Two Sum" use a HashMap for O(n) time instead of nested loops O(n²)`,
    'linked lists': `**Linked Lists Interview Tips**\n\n**Key Concepts:** Fast/slow pointers, reversal, cycle detection, merge operations\n\n**Common Questions:** Reverse Linked List, Detect Cycle, Merge Two Sorted Lists, LRU Cache\n\n**Answer Structure:** Visualize with a diagram → Explain pointer manipulation → Code carefully\n\n**Avoid:** Losing track of next pointers during reversal, not handling null head\n\n**Sample:** Use Floyd's algorithm (fast/slow pointers) for cycle detection in O(n) time O(1) space`,
    default: `**${topic} Interview Tips**\n\n**Key Concepts:**\n- Understand fundamentals thoroughly\n- Practice common patterns and problems\n- Know time/space complexity tradeoffs\n\n**Preparation Strategy:**\n- Study 2-3 core concepts daily\n- Solve 2-3 practice problems\n- Review your solutions after 24 hours\n\n**During the Interview:**\n- Clarify requirements before coding\n- Think aloud to show your thought process\n- Start with brute force, then optimize\n- Test with examples including edge cases\n\n**Common Mistakes to Avoid:**\n- Jumping to code without understanding\n- Not considering edge cases\n- Silent coding without communication\n- Ignoring time/space complexity\n\n**Pro Tip:** Always ask clarifying questions — interviewers value problem-solving approach over just getting the right answer.`,
  };

  const key = topic.toLowerCase();
  return tips[key] || tips.default;
};

// ─── Mock Interview Questions ─────────────────────────────────────────────────

const generateMockQuestions = async (category, difficulty, count = 5) => {
  if (openai) {
    const systemPrompt = `You are an expert technical interviewer. Generate realistic interview questions.`;
    const userPrompt = `Generate ${count} ${difficulty} ${category} interview questions. For each question provide:
- Question text
- Expected answer outline (2-3 sentences)
- Key concepts tested
Return as a JSON array with fields: question, expectedAnswer, concepts`;
    const text = await callOpenAI(systemPrompt, userPrompt, 1000);
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {
      // fall through to mock
    }
  }
  return generateMockQuestionsList(category, difficulty, count);
};

const generateMockQuestionsList = (category, difficulty, count) => {
  const questionBank = {
    DSA: [
      { question: 'Explain the difference between BFS and DFS. When would you use each?', expectedAnswer: 'BFS uses a queue and explores level by level — best for shortest path problems. DFS uses a stack/recursion and explores depth-first — best for cycle detection and topological sort.', concepts: ['Graph traversal', 'Queue', 'Stack'] },
      { question: 'What is dynamic programming? Give an example problem.', expectedAnswer: 'DP breaks problems into overlapping subproblems and stores results to avoid recomputation. Classic example: Fibonacci sequence — store computed values in an array.', concepts: ['Memoization', 'Tabulation', 'Optimization'] },
      { question: 'Explain time and space complexity with an example.', expectedAnswer: 'Time complexity measures operations relative to input size; space measures memory. Example: Linear search is O(n) time, O(1) space.', concepts: ['Big O notation', 'Algorithm analysis'] },
      { question: 'What are the different types of sorting algorithms and their complexities?', expectedAnswer: 'Bubble/Insertion/Selection: O(n²). Merge/Heap sort: O(n log n). Quick sort: O(n log n) average. Counting sort: O(n+k) for integers.', concepts: ['Sorting', 'Complexity analysis'] },
      { question: 'How does a hash map work? What is collision resolution?', expectedAnswer: 'Hash maps use a hash function to map keys to array indices. Collisions are resolved by chaining (linked lists at each slot) or open addressing (probing for next empty slot).', concepts: ['Hashing', 'Data structures'] },
    ],
    HR: [
      { question: 'Tell me about yourself.', expectedAnswer: 'Structure: Present (current role/studies) → Past (relevant experience) → Future (why this role). Keep it professional and relevant to the job.', concepts: ['Self-presentation', 'Communication'] },
      { question: 'Describe a time you handled a difficult team conflict.', expectedAnswer: 'Use STAR method: Situation, Task, Action, Result. Focus on how you facilitated communication and found a resolution that benefited the team.', concepts: ['Conflict resolution', 'Teamwork', 'STAR method'] },
      { question: 'Where do you see yourself in 5 years?', expectedAnswer: 'Show ambition aligned with the company\'s growth. Mention skill development, taking on leadership, and contributing to impactful projects.', concepts: ['Career planning', 'Goal setting'] },
      { question: 'Why do you want to work at our company?', expectedAnswer: 'Research the company beforehand. Mention specific products, culture, mission, or technologies. Connect their work to your personal goals.', concepts: ['Company research', 'Motivation'] },
      { question: 'What is your greatest weakness?', expectedAnswer: 'Choose a real but non-critical weakness, explain steps you\'re taking to improve it, and show growth mindset. Avoid clichés like "I\'m a perfectionist."', concepts: ['Self-awareness', 'Growth mindset'] },
    ],
    Core: [
      { question: 'Explain ACID properties in databases.', expectedAnswer: 'Atomicity (all or nothing), Consistency (valid state transitions), Isolation (concurrent transactions don\'t interfere), Durability (committed data persists).', concepts: ['Database transactions', 'DBMS'] },
      { question: 'What is the difference between process and thread?', expectedAnswer: 'A process is an independent program with its own memory space. A thread is a lightweight unit within a process sharing the same memory. Threads are faster to create and communicate.', concepts: ['OS', 'Concurrency'] },
      { question: 'Explain the OSI model layers.', expectedAnswer: 'Physical, Data Link, Network, Transport, Session, Presentation, Application. Each layer has specific responsibilities — e.g., Transport handles TCP/UDP, Network handles IP routing.', concepts: ['Networking', 'OSI model'] },
      { question: 'What are the four pillars of OOP?', expectedAnswer: 'Encapsulation (hiding data), Abstraction (hiding complexity), Inheritance (reusing code), Polymorphism (same interface different behavior).', concepts: ['OOP', 'Software design'] },
      { question: 'What is normalization in databases?', expectedAnswer: 'Normalization organizes data to reduce redundancy. 1NF: atomic values; 2NF: no partial dependencies; 3NF: no transitive dependencies; BCNF: every determinant is a candidate key.', concepts: ['Database design', 'Normalization'] },
    ],
  };

  const pool = questionBank[category] || questionBank.DSA;
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

module.exports = {
  getCodeFeedback,
  analyzeResume,
  getInterviewTip,
  generateMockQuestions,
};
