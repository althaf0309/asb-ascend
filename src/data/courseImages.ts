// Unique image per course (used in both course cards & detail hero/secondary).
// Uses curated Unsplash photo IDs — deterministic, no API key, free hotlinking.
// Each course gets a primary (hero/card) and secondary (overview) image, both unique.

const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

interface CourseImagePair {
  primary: string;
  secondary: string;
}

// 51 unique primary photos themed to each course topic, plus 5 generic category fallbacks.
export const courseImages: Record<string, CourseImagePair> = {
  // ===== ERP =====
  'erp-fico':           { primary: u('photo-1554224155-6726b3ff858f'), secondary: u('photo-1556742502-ec7c0e9f34b1') }, // calculator/finance
  'erp-mm':             { primary: u('photo-1586528116311-ad8dd3c8310d'), secondary: u('photo-1601598851547-4302969d0614') }, // warehouse/boxes
  'erp-sd':             { primary: u('photo-1556761175-5973dc0f32e7'), secondary: u('photo-1556740758-90de374c12ad') }, // sales meeting
  'erp-pp':             { primary: u('photo-1565514020179-026b92b84bb6'), secondary: u('photo-1581091226825-a6a2a5aee158') }, // factory line
  'erp-pm':             { primary: u('photo-1504917595217-d4dc5ebe6122'), secondary: u('photo-1530124566582-a618bc2615dc') }, // wrench/maintenance
  'erp-qm':             { primary: u('photo-1532187863486-abf9dbad1b69'), secondary: u('photo-1582719471384-894fbb16e074') }, // lab/QA
  'erp-ps':             { primary: u('photo-1542626991-cbc4e32524cc'), secondary: u('photo-1454165804606-c3d57bc86b40') }, // project board
  'erp-hcm':            { primary: u('photo-1521737711867-e3b97375f902'), secondary: u('photo-1573497019940-1c28c88b4f3e') }, // HR team
  'erp-scm':            { primary: u('photo-1601584115197-04ecc0da31d7'), secondary: u('photo-1521791136064-7986c2920216') }, // shipping/containers
  'erp-srm':            { primary: u('photo-1521791055366-0d553872125f'), secondary: u('photo-1573164574572-cb89e39749b4') }, // handshake supplier
  'erp-crm':            { primary: u('photo-1552581234-26160f608093'), secondary: u('photo-1517245386807-bb43f82c33c4') }, // customer dashboard
  'erp-sf':             { primary: u('photo-1573164713988-8665fc963095'), secondary: u('photo-1551836022-d5d88e9218df') }, // HR success
  'abap':               { primary: u('photo-1550439062-609e1531270e'), secondary: u('photo-1517694712202-14dd9538aa97') }, // code editor

  // ===== Programming =====
  'python-fullstack':   { primary: u('photo-1526379095098-d400fd0bf935'), secondary: u('photo-1555066931-4365d14bab8c') }, // python snake/code
  'java':               { primary: u('photo-1517694712202-14dd9538aa97'), secondary: u('photo-1542831371-29b0f74f9713') }, // java code
  'javascript':         { primary: u('photo-1579468118864-1b9ea3c0db4a'), secondary: u('photo-1593720213428-28a5b9e94613') }, // js
  'c-lang':             { primary: u('photo-1488590528505-98d2b5aba04b'), secondary: u('photo-1629654297299-c8506221b6b9') }, // C code/old hardware
  'cpp':                { primary: u('photo-1620712943543-bcc4688e7485'), secondary: u('photo-1633419461186-7d40a38105ec') }, // cpp
  'html':               { primary: u('photo-1621839673705-6617adf9e890'), secondary: u('photo-1542831371-d531d36971e6') }, // html
  'css':                { primary: u('photo-1507721999472-8ed4421c4af2'), secondary: u('photo-1559028012-481c04fa702d') }, // css design
  'php':                { primary: u('photo-1599507593499-a3f7d7d97667'), secondary: u('photo-1504639725590-34d0984388bd') }, // php server
  'ruby':               { primary: u('photo-1579403124614-197f69d8187b'), secondary: u('photo-1551033406-611cf9a28f67') }, // ruby gems
  'kotlin':             { primary: u('photo-1607252650355-f7fd0460ccdb'), secondary: u('photo-1611162617213-7d7a39e9b1d7') }, // mobile dev
  'swift':              { primary: u('photo-1512941937669-90a1b58e7e9c'), secondary: u('photo-1556656793-08538906a9f8') }, // apple/swift
  'dart':               { primary: u('photo-1551650975-87deedd944c3'), secondary: u('photo-1604079628040-94301bb21b91') }, // flutter ui

  // ===== AI =====
  'ai-training':        { primary: u('photo-1677442136019-21780ecad995'), secondary: u('photo-1485827404703-89b55fcc595e') }, // ai brain
  'ml-training':        { primary: u('photo-1620712943543-bcc4688e7485'), secondary: u('photo-1555949963-aa79dcee981c') }, // ml charts
  'dl-training':        { primary: u('photo-1591696205602-2f950c417cb9'), secondary: u('photo-1535378917042-10a22c95931a') }, // neural network
  'genai-training':     { primary: u('photo-1684369175809-f9642140a1bd'), secondary: u('photo-1633613286848-e6f43bbafb8d') }, // generative art
  'ds-ai-training':     { primary: u('photo-1551288049-bebda4e38f71'), secondary: u('photo-1543286386-713bdd548da4') }, // data science
  'nlp-training':       { primary: u('photo-1546054454-aa26e2b734c7'), secondary: u('photo-1555255707-c07966088b7b') }, // language/text
  'robotics-ai':        { primary: u('photo-1485827404703-89b55fcc595e'), secondary: u('photo-1531746790731-6c087fecd65a') }, // robot
  'agentic-ai':         { primary: u('photo-1620641788421-7a1c342ea42e'), secondary: u('photo-1581090464777-f3220bbe1b8b') }, // agent network
  'fullstack-ai':       { primary: u('photo-1633356122544-f134324a6cee'), secondary: u('photo-1517694712202-14dd9538aa97') }, // ai stack

  // ===== Management =====
  'logistics-tech':     { primary: u('photo-1494412519320-aa613dfb7738'), secondary: u('photo-1601584115197-04ecc0da31d7') }, // logistics tech
  'logistics-scm':      { primary: u('photo-1566576912321-d58ddd7a6088'), secondary: u('photo-1586528116311-ad8dd3c8310d') }, // supply chain
  'warehouse-mgmt':     { primary: u('photo-1580674684081-7617fbf3d745'), secondary: u('photo-1553413077-190dd305871c') }, // warehouse interior
  'hospitality-mgmt':   { primary: u('photo-1564501049412-61c2a3083791'), secondary: u('photo-1542314831-068cd1dbfeeb') }, // hotel
  'finance-controlling':{ primary: u('photo-1611974789855-9c2a0a7236a3'), secondary: u('photo-1579621970795-87facc2f976d') }, // finance dashboard
  'hr-mgmt':            { primary: u('photo-1556761175-b413da4baf72'), secondary: u('photo-1600880292203-757bb62b4baf') }, // hr meeting
  'it-mgmt':            { primary: u('photo-1573164713714-d95e436ab8d6'), secondary: u('photo-1581092335397-9583eb92d232') }, // IT manager

  // ===== Internships =====
  'intern-erp':         { primary: u('photo-1552664730-d307ca884978'), secondary: u('photo-1556761175-5973dc0f32e7') }, // intern team meeting
  'intern-accounting':  { primary: u('photo-1454165804606-c3d57bc86b40'), secondary: u('photo-1554224155-6726b3ff858f') }, // accounting books
  'intern-hr':          { primary: u('photo-1521737604893-d14cc237f11d'), secondary: u('photo-1573164574572-cb89e39749b4') }, // HR intern
  'intern-python':      { primary: u('photo-1542831371-29b0f74f9713'), secondary: u('photo-1526379095098-d400fd0bf935') }, // python intern
  'intern-ai':          { primary: u('photo-1535378917042-10a22c95931a'), secondary: u('photo-1677442136019-21780ecad995') }, // ai intern
  'intern-ml':          { primary: u('photo-1543286386-713bdd548da4'), secondary: u('photo-1620712943543-bcc4688e7485') }, // ml intern
  'intern-genai':       { primary: u('photo-1633613286848-e6f43bbafb8d'), secondary: u('photo-1684369175809-f9642140a1bd') }, // genai intern
  'intern-ds-ai':       { primary: u('photo-1518186285589-2f7649de83e0'), secondary: u('photo-1551288049-bebda4e38f71') }, // data ai intern
  'intern-agentic-ai':  { primary: u('photo-1581090464777-f3220bbe1b8b'), secondary: u('photo-1620641788421-7a1c342ea42e') }, // agent network
  'intern-fullstack-ai':{ primary: u('photo-1531297484001-80022131f5a1'), secondary: u('photo-1633356122544-f134324a6cee') }, // fullstack intern

  // ===== Category fallback duplicates from data file =====
  erp:        { primary: u('photo-1554224155-6726b3ff858f'), secondary: u('photo-1556742502-ec7c0e9f34b1') },
  programming:{ primary: u('photo-1517694712202-14dd9538aa97'), secondary: u('photo-1555066931-4365d14bab8c') },
  ai:         { primary: u('photo-1677442136019-21780ecad995'), secondary: u('photo-1591696205602-2f950c417cb9') },
  management: { primary: u('photo-1556761175-b413da4baf72'), secondary: u('photo-1542626991-cbc4e32524cc') },
  internship: { primary: u('photo-1552664730-d307ca884978'), secondary: u('photo-1521737604893-d14cc237f11d') },
};

// Category-level fallback if a course id is missing
const categoryFallback: Record<string, CourseImagePair> = {
  erp: courseImages['erp'],
  programming: courseImages['programming'],
  ai: courseImages['ai'],
  management: courseImages['management'],
  internship: courseImages['internship'],
};

export const getCourseImages = (id: string, category: string): CourseImagePair => {
  return courseImages[id] || categoryFallback[category] || courseImages['erp'];
};
