require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
// Fallback to .env.example values if .env not found
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/hire_ready';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'hire_ready_dev_secret_2024';
}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Question = require('../models/Question');

const sampleQuestions = [
  // ─── DSA Questions ─────────────────────────────────────────────────────────
  {
    title: 'Two Sum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: 'Easy',
    category: 'DSA',
    subcategory: 'Arrays',
    tags: ['array', 'hash-table'],
    company: ['Google', 'Amazon', 'Microsoft', 'Facebook'],
    topic: ['Two Pointers', 'Hash Map'],
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9, return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'nums[1] + nums[2] == 6.' },
    ],
    hints: ['Use a hash map to store complement values', 'For each number, check if target - num exists in the map'],
    testCases: [
      { input: '[2,7,11,15]\n9', output: '[0,1]', isHidden: false },
      { input: '[3,2,4]\n6', output: '[1,2]', isHidden: false },
      { input: '[3,3]\n6', output: '[0,1]', isHidden: true },
      { input: '[1,2,3,4,5]\n9', output: '[3,4]', isHidden: true },
    ],
    starterCode: [
      { language: 'javascript', code: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    // Your solution here\n};' },
      { language: 'python', code: 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Your solution here\n        pass' },
      { language: 'java', code: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your solution here\n        return new int[]{};\n    }\n}' },
      { language: 'cpp', code: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your solution here\n    }\n};' },
    ],
    acceptanceRate: 49,
  },
  {
    title: 'Reverse Linked List',
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
    difficulty: 'Easy',
    category: 'DSA',
    subcategory: 'Linked Lists',
    tags: ['linked-list', 'recursion'],
    company: ['Amazon', 'Microsoft', 'Apple'],
    topic: ['Recursion', 'Iteration'],
    constraints: 'The number of nodes in the list is the range [0, 5000]\n-5000 <= Node.val <= 5000',
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
    ],
    hints: ['Use three pointers: prev, curr, next', 'Or use recursion with base case at null node'],
    testCases: [
      { input: '[1,2,3,4,5]', output: '[5,4,3,2,1]', isHidden: false },
      { input: '[1,2]', output: '[2,1]', isHidden: false },
      { input: '[]', output: '[]', isHidden: true },
    ],
    starterCode: [
      { language: 'javascript', code: 'var reverseList = function(head) {\n    // Your solution here\n};' },
      { language: 'python', code: 'def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n    # Your solution here\n    pass' },
    ],
    acceptanceRate: 73,
  },
  {
    title: 'Valid Parentheses',
    description: `Given a string \`s\` containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    difficulty: 'Easy',
    category: 'DSA',
    subcategory: 'Stacks',
    tags: ['string', 'stack'],
    company: ['Google', 'Amazon', 'Bloomberg'],
    topic: ['Stack', 'String'],
    constraints: '1 <= s.length <= 10^4\ns consists of parentheses only \'()[]{}\' ',
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    hints: ['Use a stack to track open brackets', 'When you see a closing bracket, check if it matches the top of the stack'],
    testCases: [
      { input: '()', output: 'true', isHidden: false },
      { input: '()[]{}", output: "true', isHidden: false },
      { input: '(]', output: 'false', isHidden: false },
      { input: '{[]}', output: 'true', isHidden: true },
    ],
    starterCode: [
      { language: 'javascript', code: 'var isValid = function(s) {\n    // Your solution here\n};' },
      { language: 'python', code: 'def isValid(self, s: str) -> bool:\n    # Your solution here\n    pass' },
    ],
    acceptanceRate: 40,
  },
  {
    title: 'Binary Search',
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
    difficulty: 'Easy',
    category: 'DSA',
    subcategory: 'Binary Search',
    tags: ['array', 'binary-search'],
    company: ['Facebook', 'LinkedIn', 'Adobe'],
    topic: ['Divide and Conquer', 'Binary Search'],
    constraints: '1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4\nAll values in nums are unique\nnums is sorted in ascending order',
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist in nums so return -1' },
    ],
    hints: ['Maintain two pointers: left and right', 'Calculate mid = (left + right) / 2', 'Adjust left or right based on comparison'],
    testCases: [
      { input: '[-1,0,3,5,9,12]\n9', output: '4', isHidden: false },
      { input: '[-1,0,3,5,9,12]\n2', output: '-1', isHidden: false },
      { input: '[5]\n5', output: '0', isHidden: true },
    ],
    starterCode: [
      { language: 'javascript', code: 'var search = function(nums, target) {\n    // Your solution here\n};' },
      { language: 'python', code: 'def search(self, nums: List[int], target: int) -> int:\n    # Your solution here\n    pass' },
    ],
    acceptanceRate: 56,
  },
  {
    title: 'Maximum Subarray',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.`,
    difficulty: 'Medium',
    category: 'DSA',
    subcategory: 'Dynamic Programming',
    tags: ['array', 'dynamic-programming', 'divide-and-conquer'],
    company: ['Amazon', 'Apple', 'LinkedIn', 'Microsoft'],
    topic: ['Kadane\'s Algorithm', 'Dynamic Programming'],
    constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1' },
      { input: 'nums = [5,4,-1,7,8]', output: '23' },
    ],
    hints: ['Use Kadane\'s algorithm', 'Keep track of current sum and max sum', 'Reset current sum to 0 if it becomes negative'],
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', output: '6', isHidden: false },
      { input: '[1]', output: '1', isHidden: false },
      { input: '[5,4,-1,7,8]', output: '23', isHidden: true },
      { input: '[-1,-2,-3]', output: '-1', isHidden: true },
    ],
    starterCode: [
      { language: 'javascript', code: 'var maxSubArray = function(nums) {\n    // Your solution here\n};' },
      { language: 'python', code: 'def maxSubArray(self, nums: List[int]) -> int:\n    # Your solution here\n    pass' },
    ],
    acceptanceRate: 50,
  },
  {
    title: 'LRU Cache',
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\` Initialize the LRU cache with positive size \`capacity\`.
- \`int get(int key)\` Return the value of the \`key\` if the key exists, otherwise return \`-1\`.
- \`void put(int key, int value)\` Update the value of the \`key\` if the \`key\` exists. Otherwise, add the \`key-value\` pair to the cache. If the number of keys exceeds the \`capacity\` from this operation, evict the least recently used key.

The functions \`get\` and \`put\` must each run in \`O(1)\` average time complexity.`,
    difficulty: 'Hard',
    category: 'DSA',
    subcategory: 'Design',
    tags: ['hash-table', 'linked-list', 'design', 'doubly-linked-list'],
    company: ['Amazon', 'Google', 'Microsoft', 'Facebook', 'Uber'],
    topic: ['Hash Map', 'Doubly Linked List'],
    constraints: '1 <= capacity <= 3000\n0 <= key <= 10^4\n0 <= value <= 10^5',
    examples: [
      { input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]', output: '[null, null, null, 1, null, -1, null, -1, 3, 4]' },
    ],
    hints: ['Combine a HashMap with a doubly linked list', 'HashMap provides O(1) access, linked list maintains order', 'Most recently used goes to the front, least recently used is at the back'],
    testCases: [
      { input: 'capacity=2\nput(1,1)\nput(2,2)\nget(1)\nput(3,3)\nget(2)\nput(4,4)\nget(1)\nget(3)\nget(4)', output: '1,-1,-1,3,4', isHidden: false },
    ],
    starterCode: [
      { language: 'javascript', code: '/**\n * @param {number} capacity\n */\nvar LRUCache = function(capacity) {\n    // Your implementation\n};\n\nLRUCache.prototype.get = function(key) {\n    // Your implementation\n};\n\nLRUCache.prototype.put = function(key, value) {\n    // Your implementation\n};' },
    ],
    acceptanceRate: 42,
  },

  // ─── HR Questions ───────────────────────────────────────────────────────────
  {
    title: 'Tell Me About Yourself',
    description: `This is typically the first question in an interview. Craft a compelling 2-minute response that covers:

**Structure your answer:**
1. **Present**: Your current role/studies and key responsibilities
2. **Past**: Relevant experience that led you here  
3. **Future**: Why you're excited about this specific opportunity

**What interviewers are looking for:**
- Communication skills
- Self-awareness
- Relevance to the role
- Professionalism and confidence

Write or outline your ideal 2-minute "Tell me about yourself" response for a Software Engineer position.`,
    difficulty: 'Easy',
    category: 'HR',
    subcategory: 'Behavioral',
    tags: ['introduction', 'behavioral', 'communication'],
    company: ['Google', 'Amazon', 'Microsoft', 'Facebook', 'Apple'],
    topic: ['Self Presentation', 'Communication'],
    constraints: 'Keep response to 2-3 minutes when spoken\nFocus on professional journey\nEnd with enthusiasm for the role',
    examples: [
      { input: 'Fresh graduate applying for SDE-1 role', output: 'Hi, I\'m [Name], a Computer Science graduate from [University]. During my studies, I built [project] using [technologies] which taught me [skill]. I interned at [Company] where I [achievement]. I\'m excited about this role because [specific reason].', explanation: 'Professional, concise, and role-relevant' },
    ],
    hints: [
      'Start with your current situation (studies/work)',
      'Highlight 1-2 key achievements with metrics',
      'Connect your background to the role requirements',
      'Show enthusiasm for the specific company',
    ],
    testCases: [
      { input: 'Experienced developer with 3 years experience', output: 'Mention: current role, key achievement with impact, why interested in this company specifically', isHidden: false },
    ],
    starterCode: [],
    acceptanceRate: 85,
  },
  {
    title: 'Describe a Challenge You Overcame',
    description: `Behavioral question testing problem-solving, resilience, and communication skills.

**Use the STAR method:**
- **S**ituation: Set the context
- **T**ask: Explain your responsibility
- **A**ction: Describe what YOU specifically did
- **R**esult: Share the measurable outcome

**Common mistake:** Talking about "we" instead of "I" — interviewers want to know YOUR contribution.

Describe a technical or professional challenge you overcame, using the STAR method.`,
    difficulty: 'Medium',
    category: 'HR',
    subcategory: 'Behavioral',
    tags: ['behavioral', 'STAR method', 'problem-solving', 'resilience'],
    company: ['Amazon', 'Google', 'Microsoft'],
    topic: ['Leadership Principles', 'STAR Method'],
    constraints: 'Use a real or realistic example\nQuantify the result where possible\nFocus on YOUR actions, not team actions',
    examples: [
      { input: 'Technical challenge scenario', output: 'S: Our production system went down at 2 AM\nT: As on-call engineer, I had to restore service\nA: I identified the DB connection issue, implemented a fix, and added monitoring\nR: Resolved in 45 minutes, preventing $50K in lost revenue; added runbook for future', explanation: 'Clear STAR structure with quantified impact' },
    ],
    hints: [
      'Choose a challenge relevant to the role you\'re applying for',
      'Make the "Action" step the longest part',
      'Quantify results: time saved, revenue impact, performance improvement',
      'End with what you learned from the experience',
    ],
    testCases: [
      { input: 'Challenge in a team project', output: 'Must include: specific situation, your role, concrete actions taken, measurable result', isHidden: false },
    ],
    starterCode: [],
    acceptanceRate: 70,
  },
  {
    title: 'Why Do You Want to Work Here?',
    description: `This question tests how well you've researched the company and whether your values align with theirs.

**Research areas before answering:**
1. Company mission and values
2. Recent news, product launches, or milestones
3. Engineering culture and tech stack
4. The team's impact on industry

**Strong answers include:**
- Specific company initiatives you admire
- How your skills add value
- Long-term growth alignment

Write a compelling answer for why you want to work at a specific tech company of your choice.`,
    difficulty: 'Easy',
    category: 'HR',
    subcategory: 'Motivation',
    tags: ['motivation', 'company research', 'culture fit'],
    company: ['Google', 'Amazon', 'Microsoft', 'Apple', 'Meta'],
    topic: ['Company Research', 'Career Goals'],
    constraints: 'Be specific — avoid generic answers\nMention actual products/initiatives\nAlign with your genuine career goals',
    examples: [
      { input: 'Applying to Google', output: 'I\'ve been following Google\'s work on [specific project/product]. The way you [specific innovation] aligns with my passion for [area]. I also admire your approach to [engineering culture aspect]. I believe my experience in [relevant skill] would let me contribute meaningfully to [specific team/product].', explanation: 'Specific, researched, and personalized' },
    ],
    hints: [
      'Visit the company\'s engineering blog',
      'Check recent news on their products',
      'Look at their open-source contributions',
      'Read Glassdoor reviews to understand the culture',
    ],
    testCases: [
      { input: 'Target: any top tech company', output: 'Answer should mention: specific product/initiative, cultural alignment, how your skills contribute', isHidden: false },
    ],
    starterCode: [],
    acceptanceRate: 80,
  },

  // ─── Core CS Questions ──────────────────────────────────────────────────────
  {
    title: 'Explain ACID Properties',
    description: `Database transactions must satisfy ACID properties to ensure data integrity.

**Explain each property with a real-world banking example:**

**A - Atomicity**: A transaction is all-or-nothing. If any part fails, the entire transaction is rolled back.

**C - Consistency**: A transaction brings the database from one valid state to another. All data integrity rules must be satisfied.

**I - Isolation**: Concurrent transactions execute as if they were serial. Intermediate states are not visible to other transactions.

**D - Durability**: Once a transaction is committed, it remains committed even in the case of system failure.

Explain ACID properties and describe how they apply to a bank transfer scenario.`,
    difficulty: 'Easy',
    category: 'Core',
    subcategory: 'DBMS',
    tags: ['database', 'ACID', 'transactions', 'DBMS'],
    company: ['Oracle', 'Microsoft', 'Amazon', 'Google'],
    topic: ['Database Transactions', 'Data Integrity'],
    constraints: 'Use a practical example\nExplain failure scenarios for each property\nMention SQL commands where relevant',
    examples: [
      { input: 'Bank transfer: Alice sends $100 to Bob', output: 'A: Either both debit and credit happen, or neither\nC: Total balance stays same ($1000 before = $1000 after)\nI: Another transaction cannot see partial state\nD: After COMMIT, data survives crash' },
    ],
    hints: [
      'Atomicity: Think "all or nothing"',
      'Consistency: Think "valid state to valid state"',
      'Isolation: Think "serializable execution"',
      'Durability: Think "committed = permanent"',
    ],
    testCases: [
      { input: 'What happens if system crashes mid-transfer?', output: 'Atomicity ensures rollback. Durability ensures committed transfers survive.', isHidden: false },
      { input: 'Two users withdraw from same account simultaneously?', output: 'Isolation prevents race conditions via locking or MVCC', isHidden: false },
    ],
    starterCode: [],
    acceptanceRate: 75,
  },
  {
    title: 'Process vs Thread',
    description: `A fundamental Operating Systems concept frequently asked in interviews.

**Process:**
- An independent program in execution
- Has its own memory space (heap, stack, code, data)
- Heavyweight — creation is expensive
- Inter-process communication (IPC) is complex

**Thread:**
- A lightweight unit of execution within a process
- Shares memory with other threads in the same process
- Lightweight — creation is fast
- Communication is easy (shared memory) but requires synchronization

**Key Questions:**
1. What is a context switch?
2. What are race conditions and how do you prevent them?
3. What is a deadlock?

Answer: When would you choose multi-processing over multi-threading?`,
    difficulty: 'Medium',
    category: 'Core',
    subcategory: 'Operating Systems',
    tags: ['OS', 'process', 'thread', 'concurrency', 'synchronization'],
    company: ['Microsoft', 'Google', 'Amazon', 'Apple'],
    topic: ['Operating Systems', 'Concurrency', 'Parallelism'],
    constraints: 'Include memory model differences\nDiscuss synchronization primitives\nGive real-world examples',
    examples: [
      { input: 'When to use multi-processing?', output: 'Use processes for: CPU-bound tasks needing isolation, tasks with different privileges, when a crash in one shouldn\'t affect others (e.g., Chrome\'s tab isolation)' },
      { input: 'When to use multi-threading?', output: 'Use threads for: I/O-bound tasks, shared memory access, lightweight parallelism (e.g., web server handling requests)' },
    ],
    hints: [
      'Think about memory isolation vs sharing',
      'Consider CPU-bound vs I/O-bound tasks',
      'Python has GIL — threads don\'t run in parallel for CPU tasks',
      'Deadlock requires: mutual exclusion, hold-and-wait, no preemption, circular wait',
    ],
    testCases: [
      { input: 'How does a context switch work?', output: 'OS saves process/thread state (registers, PC, stack) to PCB/TCB, loads next process/thread state, resumes execution', isHidden: false },
      { input: 'What is a race condition?', output: 'When two threads access shared data concurrently and outcome depends on execution order. Prevented by mutexes, semaphores, or atomic operations', isHidden: false },
    ],
    starterCode: [],
    acceptanceRate: 68,
  },
  {
    title: 'HTTP vs HTTPS and REST API Design',
    description: `Two critical networking concepts for software engineers.

**HTTP vs HTTPS:**
- HTTP: HyperText Transfer Protocol — data sent in plaintext
- HTTPS: HTTP Secure — encrypted using TLS/SSL
- HTTPS provides: encryption, authentication, data integrity

**REST API Principles:**
1. **Stateless**: Each request contains all information needed
2. **Client-Server**: Clear separation of concerns
3. **Uniform Interface**: Standard HTTP methods (GET, POST, PUT, DELETE)
4. **Resource-Based**: URLs represent resources, not actions
5. **Cacheable**: Responses can be cached

**HTTP Status Codes:**
- 2xx: Success (200 OK, 201 Created, 204 No Content)
- 3xx: Redirection
- 4xx: Client Error (400 Bad Request, 401 Unauthorized, 404 Not Found)
- 5xx: Server Error (500 Internal Server Error)

Design REST API endpoints for a simple blog platform.`,
    difficulty: 'Medium',
    category: 'Core',
    subcategory: 'Networks',
    tags: ['networking', 'HTTP', 'REST', 'API design'],
    company: ['Google', 'Amazon', 'Stripe', 'Twilio'],
    topic: ['Web Development', 'API Design', 'Networking'],
    constraints: 'Follow REST conventions\nUse proper HTTP methods and status codes\nConsider authentication and rate limiting',
    examples: [
      { input: 'Blog platform API design', output: 'GET /posts — list all posts\nGET /posts/:id — get specific post\nPOST /posts — create post (auth required)\nPUT /posts/:id — update post (auth required)\nDELETE /posts/:id — delete post (auth required)\nGET /posts/:id/comments — get comments' },
    ],
    hints: [
      'Use nouns for resource names, not verbs',
      'Use plural nouns: /users, not /user',
      'Nest resources logically: /users/:id/posts',
      'Version your APIs: /api/v1/posts',
    ],
    testCases: [
      { input: 'How to handle pagination in REST APIs?', output: 'Use query params: GET /posts?page=1&limit=20 or cursor-based: GET /posts?cursor=abc123&limit=20', isHidden: false },
      { input: 'Difference between PUT and PATCH?', output: 'PUT replaces entire resource; PATCH partially updates resource. PATCH is more efficient for partial updates.', isHidden: false },
    ],
    starterCode: [],
    acceptanceRate: 65,
  },
  {
    title: 'Object-Oriented Programming Principles',
    description: `OOP is a programming paradigm based on objects. The four main pillars are essential knowledge for any software engineering interview.

**1. Encapsulation**
Bundling data and methods, hiding internal implementation details.
- Use private/protected access modifiers
- Expose only necessary public interfaces

**2. Abstraction**
Hiding complexity by exposing only relevant features.
- Abstract classes and interfaces in Java
- Focus on WHAT an object does, not HOW

**3. Inheritance**
A class (child) inherits properties and methods from another class (parent).
- Promotes code reuse
- Follows "is-a" relationship
- Be careful with deep inheritance hierarchies

**4. Polymorphism**
The ability for objects of different classes to be treated as the same type.
- Method overriding (runtime polymorphism)
- Method overloading (compile-time polymorphism)

Design a class hierarchy for a vehicle management system using all four OOP principles.`,
    difficulty: 'Medium',
    category: 'Core',
    subcategory: 'OOP',
    tags: ['OOP', 'design', 'inheritance', 'polymorphism', 'encapsulation'],
    company: ['Microsoft', 'Amazon', 'Oracle', 'IBM'],
    topic: ['Object-Oriented Design', 'Software Engineering'],
    constraints: 'Design at least 3 classes\nDemonstrate all 4 OOP principles\nUse any language for demonstration',
    examples: [
      { input: 'Vehicle management system', output: 'Abstract class Vehicle { private make, model; abstract startEngine(); }\nclass Car extends Vehicle { override startEngine() {...} }\nclass ElectricCar extends Car { override startEngine() { chargeBattery(); } }\nInterface IRefuelable { void refuel(); }' },
    ],
    hints: [
      'Start with the most general class (Animal/Vehicle/Shape)',
      'Use abstract classes for common behavior with implementation gaps',
      'Use interfaces for contracts that different class hierarchies can implement',
      'Prefer composition over inheritance when possible',
    ],
    testCases: [
      { input: 'Explain method overriding vs overloading', output: 'Overriding: child class redefines parent method (same signature). Overloading: multiple methods with same name but different parameters.', isHidden: false },
      { input: 'What is the Liskov Substitution Principle?', output: 'Objects of subclass should be substitutable for objects of superclass without breaking functionality. Part of SOLID principles.', isHidden: false },
    ],
    starterCode: [
      { language: 'javascript', code: '// Design your vehicle class hierarchy here\nclass Vehicle {\n    constructor(make, model) {\n        this.make = make;\n        this.model = model;\n    }\n    \n    startEngine() {\n        throw new Error("Abstract method must be implemented");\n    }\n}\n\n// Add your classes below\n' },
      { language: 'python', code: 'from abc import ABC, abstractmethod\n\nclass Vehicle(ABC):\n    def __init__(self, make: str, model: str):\n        self._make = make  # Encapsulation\n        self._model = model\n    \n    @abstractmethod\n    def start_engine(self) -> str:\n        pass\n\n# Add your classes below\n' },
    ],
    acceptanceRate: 72,
  },
  {
    title: 'System Design: URL Shortener',
    description: `Design a URL shortening service like bit.ly or TinyURL.

**Requirements:**
- Functional: Shorten URLs, redirect to original URL, (optional) custom aliases
- Non-Functional: High availability, low latency, scalable to millions of URLs

**Key Design Decisions:**

**1. URL Encoding Strategy**
- Base62 encoding (a-z, A-Z, 0-9) = 62 chars
- 7 characters → 62^7 = ~3.5 trillion unique URLs
- Counter-based vs hash-based approach

**2. Database Choice**
- SQL: For strong consistency, analytics
- NoSQL (Cassandra/DynamoDB): For scale, simple key-value lookups

**3. Caching**
- Cache hot URLs (80/20 rule)
- Redis with TTL for frequently accessed URLs

**4. Scalability**
- Load balancer → Multiple application servers
- Read replicas for database
- CDN for static assets

Provide a complete system design with API design, database schema, and scaling strategy.`,
    difficulty: 'Hard',
    category: 'Core',
    subcategory: 'System Design',
    tags: ['system design', 'scalability', 'caching', 'databases'],
    company: ['Google', 'Amazon', 'Facebook', 'Twitter', 'Uber'],
    topic: ['System Design', 'Scalability', 'Architecture'],
    constraints: 'Support 100M URLs\n1000 writes/second\n10,000 reads/second\nURL expiration support',
    examples: [
      { input: 'API Design', output: 'POST /shorten {url, customAlias?, ttl?} → {shortUrl, expiresAt}\nGET /{shortCode} → 301 redirect\nGET /stats/{shortCode} → {clicks, createdAt}' },
      { input: 'Database Schema', output: 'urls table: id, short_code (indexed), original_url, created_at, expires_at, user_id, click_count' },
    ],
    hints: [
      'Start with requirements clarification (scale, features)',
      'Calculate capacity: 1000 writes/sec × 86400 = 86.4M URLs/day',
      'Use Base62 for short codes',
      'Cache with LRU eviction for hot URLs',
      'Consider consistent hashing for distributed systems',
    ],
    testCases: [
      { input: 'How to handle hash collisions?', output: 'Append counter to input before hashing, or use UUID, or check DB and retry with different seed', isHidden: false },
      { input: 'How to scale to 10x traffic?', output: 'Add read replicas, increase cache size, use CDN, horizontal scaling with load balancer, database sharding by short_code', isHidden: false },
    ],
    starterCode: [],
    acceptanceRate: 55,
  },
];

const adminUser = {
  username: 'admin',
  email: 'admin@hireready.dev',
  password: 'Admin@123',
  role: 'admin',
  profile: {
    firstName: 'Admin',
    lastName: 'User',
    bio: 'Platform administrator',
    skills: ['System Administration', 'Full Stack Development'],
  },
  stats: { problemsSolved: 50, totalSubmissions: 75 },
};

const sampleUser = {
  username: 'demo_user',
  email: 'demo@hireready.dev',
  password: 'Demo@123',
  role: 'user',
  profile: {
    firstName: 'Demo',
    lastName: 'User',
    bio: 'Software engineer preparing for interviews',
    skills: ['JavaScript', 'Python', 'React', 'Node.js'],
  },
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Question.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create(adminUser);
    console.log(`👤 Admin created: ${admin.email}`);

    // Create demo user
    const demo = await User.create(sampleUser);
    console.log(`👤 Demo user created: ${demo.email}`);

    // Create questions (with admin as creator)
    const questions = await Question.insertMany(
      sampleQuestions.map((q) => ({ ...q, createdBy: admin._id }))
    );
    console.log(`📝 Created ${questions.length} sample questions`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('─'.repeat(40));
    console.log(`Admin credentials:`);
    console.log(`  Email:    ${adminUser.email}`);
    console.log(`  Password: ${adminUser.password}`);
    console.log(`Demo user credentials:`);
    console.log(`  Email:    ${sampleUser.email}`);
    console.log(`  Password: ${sampleUser.password}`);
    console.log('─'.repeat(40));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();
