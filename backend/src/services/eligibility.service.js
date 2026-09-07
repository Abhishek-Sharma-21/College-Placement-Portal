/**
 * Core business rules engine to evaluate if a candidate student is eligible
 * to apply for a specific placement drive.
 */
export const checkEligibility = (student, profile, job) => {
  const reasons = [];

  // 1. CGPA evaluation
  if (job.minCgpa !== null && job.minCgpa !== undefined) {
    const studentCgpa = profile?.cgpa || 0;
    if (studentCgpa < job.minCgpa) {
      reasons.push(`Required CGPA: ${job.minCgpa}. Your CGPA: ${studentCgpa}`);
    }
  }

  // 2. Allowed Branches evaluation
  if (Array.isArray(job.allowedBranches) && job.allowedBranches.length > 0) {
    const studentBranch = (profile?.branch || "").trim().toLowerCase();
    const isAllowed = job.allowedBranches.some(
      (b) => b.trim().toLowerCase() === studentBranch
    );
    if (!isAllowed) {
      reasons.push(
        `Required branches: [${job.allowedBranches.join(", ")}]. Your branch: ${profile?.branch || "N/A"}`
      );
    }
  }

  // 3. Graduation Year evaluation
  if (job.gradYear !== null && job.gradYear !== undefined) {
    const studentGradYear = profile?.gradYear || 0;
    if (studentGradYear !== job.gradYear) {
      reasons.push(`Required graduation year: ${job.gradYear}. Your graduation year: ${studentGradYear}`);
    }
  }

  // 4. Required Skills evaluation
  if (Array.isArray(job.skills) && job.skills.length > 0) {
    // Parse student profile skills
    // We assume skills in profile are either a comma-separated string or array
    const studentSkills = (profile?.skills || student?.skills || [])
      .map((s) => s.trim().toLowerCase());
    
    const missingSkills = job.skills.filter(
      (skill) => !studentSkills.includes(skill.trim().toLowerCase())
    );

    if (missingSkills.length > 0) {
      reasons.push(`Missing required skills: [${missingSkills.join(", ")}]`);
    }
  }

  // 5. Backlogs evaluation (if applicable, defaulting to eligible if student profile doesn't track it)
  if (job.backlogRules !== null && job.backlogRules !== undefined) {
    const studentBacklogs = profile?.backlogs || 0;
    if (studentBacklogs > job.backlogRules) {
      reasons.push(`Max allowed backlogs: ${job.backlogRules}. Your backlogs: ${studentBacklogs}`);
    }
  }

  // 6. Experience evaluation
  if (job.experience !== null && job.experience !== undefined && job.experience > 0) {
    const studentExp = parseFloat(profile?.experience || 0);
    if (studentExp < job.experience) {
      reasons.push(`Minimum experience required: ${job.experience} years. Your experience: ${studentExp} years`);
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
};
