/**
 * Authoritative cohort figures, taken verbatim from the "Summary Table"
 * worksheet of the Liver Dashboard Voz workbook:
 * https://public.tableau.com/app/profile/kian.liddy/viz/LiverDashboardVoz
 *
 * Re-export that sheet rather than editing these by hand:
 *   public.tableau.com/views/LiverDashboardVoz/SummaryTable.csv?:showVizHome=no
 *
 * Note the confidence interval spans 1.0 and both p-values are well above 0.05:
 * this cohort shows NO significant survival difference between the high- and
 * low-expression groups. Nothing in the UI may describe it as significant.
 */
export const summaryStats = {
  /**
   * Every figure below except the patient counts is specific to THIS gene.
   * The workbook now exposes a gene dropdown on each panel, so if a viewer
   * switches genes these numbers no longer describe what they are looking at —
   * which is why the UI labels them with the gene name rather than presenting
   * them as cohort-wide facts.
   */
  gene: "MT2A",
  patientsTotal: 388,
  patientsHigh: 194,
  patientsLow: 194,
  medianExpressionTpm: 607.6,
  medianSurvivalHighMonths: 40.4,
  medianSurvivalLowMonths: 30.6,
  hazardRatio: 0.92,
  hazardRatioCI: "0.69–1.23",
  logRankP: 0.566,
  fdrAdjustedP: 0.767,
};

/**
 * The full TCGA-LIHC cohort as pulled from the GDC, parsed from
 * Data/curated/clinical.csv and Data/raw/clinical/clinical.tsv.
 *
 * This is a DIFFERENT denominator from `summaryStats`: the GDC extract holds
 * 414 cases, while the Tableau workbook analysed the 388 of them that had both
 * expression and survival data. Both are real. Every chart must state which
 * cohort it counts — never mix the two in one figure.
 */
export const gdcCohort = {
  totalCases: 414,
  alive: 264,
  deceased: 150,
  withSurvivalTime: 330,
  medianAgeYears: 61.5,
  agedCases: 403,
  gradedCases: 400,
  stagedCases: 274,
};

export const cohortStats = {
  totalCases: summaryStats.patientsTotal,
  medianAge: gdcCohort.medianAgeYears,
  // The fields below are template sample data. The GDC extract contains no
  // mutation files at all (no MAF/VCF), so mutation counts and TMB have no
  // source to reconcile against.
  totalGenes: 20531,
  totalMutations: 7066,
  tmb: 2.8,
  primarySite: "Liver",
  cancerType: "Hepatocellular Carcinoma",
  program: "TCGA",
  project: "TCGA-LIHC",
  releaseDate: "2023-12-01",
};

/* ------------------------------------------------------------------------- *
 * MIXED REAL AND SAMPLE DATA BELOW — check each export's own comment.
 *
 * REAL, from the GDC extract in /Data (n=414):
 *   stageDistribution, ageDistribution, genderDistribution, raceDistribution,
 *   tumorGradeDistribution, gdcCohort
 *
 * SAMPLE placeholder — no source exists anywhere in /Data, so every UI surface
 * rendering these must carry <SampleDataBadge />:
 *   topMutatedGenes, mutationTypes, snvClassification, mutationBurdenByStage
 *     -> the extract contains NO mutation files (no MAF, no VCF)
 *   riskFactors
 *     -> exposure.tsv covers only 6 cases with every alcohol field empty, and
 *        there are no hepatitis or cirrhosis columns in the clinical data
 *   survivalByStage
 *     -> curated/km_curves.csv is degenerate: every gene and group drops
 *        1.0 -> 0.0 at day 123, an artifact of too few cases
 *   clinicalPatients, datasetMetrics
 *     -> the extract holds 2 RNA-seq files and 5 cases of expression data,
 *        not the 742/424/379 file inventory quoted here
 * ------------------------------------------------------------------------- */

export const topMutatedGenes = [
  { gene: "TP53", frequency: 31.3, n: 116, type: "TSG", chromosome: "17p13.1" },
  { gene: "CTNNB1", frequency: 26.7, n: 99, type: "Oncogene", chromosome: "3p21.3" },
  { gene: "AXIN1", frequency: 8.4, n: 31, type: "TSG", chromosome: "16p13.3" },
  { gene: "ALB", frequency: 7.5, n: 28, type: "Other", chromosome: "4q13.3" },
  { gene: "APOB", frequency: 5.1, n: 19, type: "Other", chromosome: "2p24.1" },
  { gene: "RB1", frequency: 4.9, n: 18, type: "TSG", chromosome: "13q14.2" },
  { gene: "CDKN2A", frequency: 4.9, n: 18, type: "TSG", chromosome: "9p21.3" },
  { gene: "KEAP1", frequency: 4.6, n: 17, type: "TSG", chromosome: "19p13.2" },
  { gene: "NFE2L2", frequency: 4.3, n: 16, type: "Oncogene", chromosome: "2q31.2" },
  { gene: "ARID1A", frequency: 4.0, n: 15, type: "TSG", chromosome: "1p36.11" },
  { gene: "MLL4", frequency: 3.8, n: 14, type: "TSG", chromosome: "12q13.12" },
  { gene: "ACVR2A", frequency: 3.5, n: 13, type: "TSG", chromosome: "2q22.3" },
];

export const mutationTypes = [
  { type: "Missense", count: 4821, percentage: 68.2, color: "#f59e0b" },
  { type: "Nonsense", count: 743, percentage: 10.5, color: "#0ea5e9" },
  { type: "Frameshift", count: 598, percentage: 8.5, color: "#8b5cf6" },
  { type: "Splice Site", count: 421, percentage: 6.0, color: "#10b981" },
  { type: "In-Frame Indel", count: 281, percentage: 4.0, color: "#f43f5e" },
  { type: "Silent", count: 202, percentage: 2.8, color: "#6b7fa3" },
];

/**
 * Real AJCC pathologic stage from the GDC extract (n=414), with the substages
 * rolled up (IIIA/IIIB/IIIC -> III, IVA -> IV, IIB -> II).
 *
 * `percentage` is of the 274 staged cases. The other 140 are excluded: 139 have
 * no stage recorded and 1 is Stage 0. Keep this list to the four stages — three
 * views map over it positionally.
 */
export const stageDistribution = [
  { stage: "Stage I", count: 145, percentage: 52.9 },
  { stage: "Stage II", count: 65, percentage: 23.7 },
  { stage: "Stage III", count: 59, percentage: 21.5 },
  { stage: "Stage IV", count: 5, percentage: 1.8 },
];

/** Cases outside the four-stage breakdown (139 unrecorded + 1 Stage 0). */
export const stageNotReported = 140;

export const survivalByStage = [
  { month: 0,  stageI: 100,  stageII: 100,  stageIII: 100,  stageIV: 100  },
  { month: 6,  stageI: 83.3, stageII: 72.6, stageIII: 77.8, stageIV: 75.0 },
  { month: 12, stageI: 73.9, stageII: 58.4, stageIII: 57.4, stageIV: 50.0 },
  { month: 18, stageI: 54.3, stageII: 46.9, stageIII: 44.4, stageIV: 25.0 },
  { month: 24, stageI: 34.1, stageII: 32.7, stageIII: 29.6, stageIV: 25.0 },
  { month: 30, stageI: 29.0, stageII: 24.8, stageIII: 22.2, stageIV: 25.0 },
  { month: 36, stageI: 26.1, stageII: 19.5, stageIII: 14.8, stageIV: 25.0 },
  { month: 42, stageI: 22.5, stageII: 15.9, stageIII: 14.8, stageIV: 25.0 },
  { month: 48, stageI: 18.1, stageII: 13.3, stageIII: 13.0, stageIV: 25.0 },
  { month: 54, stageI: 13.8, stageII: 9.7,  stageIII: 9.3,  stageIV: 25.0 },
  { month: 60, stageI: 10.9, stageII: 8.8,  stageIII: 9.3,  stageIV: 25.0 },
];

/**
 * Real age bands from the GDC extract (n=414). `age_at_diagnosis` is stored in
 * days; these are days/365.25 bucketed into the same bands the Tableau workbook
 * uses. 11 cases have no age recorded.
 */
export const ageDistribution = [
  { range: "<50",   count: 80  },
  { range: "50–64", count: 160 },
  { range: "65+",   count: 163 },
];

/** Cases with no age recorded (414 total − 403 with an age). */
export const ageNotReported = 11;

export const riskFactors = [
  { factor: "Cirrhosis",   present: 156, percentage: 42.0 },
  { factor: "HBV Infection", present: 112, percentage: 30.2 },
  { factor: "Alcohol Use", present: 89,  percentage: 24.0 },
  { factor: "HCV Infection", present: 64, percentage: 17.3 },
  { factor: "NASH/NAFLD",  present: 48,  percentage: 12.9 },
];

/** Real sex split from the GDC extract — sums to the full 414 cases. */
export const genderDistribution = { male: 268, female: 146 };

/** Real race distribution from the GDC extract; the last row merges
 *  "not reported" (11), "Unknown" (4) and "American Indian/Alaska Native" (2). */
export const raceDistribution = [
  { race: "White",                        count: 216 },
  { race: "Asian",                        count: 161 },
  { race: "Black or African American",    count: 20  },
  { race: "Not Reported / Unknown",       count: 17  },
];

/**
 * Real tumour grade from Data/raw/clinical/clinical.tsv, deduplicated to one
 * grade per case (that file carries several rows per case).
 *
 * `percentage` is of the 400 graded cases; 3 are GX and 11 have no grade.
 */
export const tumorGradeDistribution = [
  { grade: "G1 (Well differentiated)",   count: 55,  percentage: 13.8 },
  { grade: "G2 (Moderately diff.)",      count: 192, percentage: 48.0 },
  { grade: "G3 (Poorly diff.)",          count: 140, percentage: 35.0 },
  { grade: "G4 (Undifferentiated)",      count: 13,  percentage: 3.3  },
];

export const mutationBurdenByStage = [
  { stage: "Stage I",   tmb: 2.1, median: 42 },
  { stage: "Stage II",  tmb: 2.8, median: 56 },
  { stage: "Stage III", tmb: 3.4, median: 68 },
  { stage: "Stage IV",  tmb: 4.2, median: 84 },
];


export const clinicalPatients = [
  { caseId: "TCGA-DD-AAVP", age: 48, gender: "M", stage: "Stage I",    grade: null, vitalStatus: "Alive",    survivalDays: 2752, hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
  { caseId: "TCGA-BC-4073", age: 73, gender: "M", stage: "Stage IIIA", grade: null, vitalStatus: "Alive",    survivalDays: 849,  hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
  { caseId: "TCGA-MI-A75E", age: 61, gender: "M", stage: "Stage IIIC", grade: null, vitalStatus: "Alive",    survivalDays: 507,  hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
  { caseId: "TCGA-G3-A7M8", age: 31, gender: "M", stage: "Stage I",    grade: null, vitalStatus: "Alive",    survivalDays: 430,  hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
  { caseId: "TCGA-DD-A11C", age: 69, gender: "M", stage: "Stage I",    grade: null, vitalStatus: "Alive",    survivalDays: 662,  hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
  { caseId: "TCGA-DD-A114", age: 42, gender: "M", stage: "Stage II",   grade: null, vitalStatus: "Deceased", survivalDays: 1149, hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
  { caseId: "TCGA-WX-AA46", age: 62, gender: "M", stage: "Stage II",   grade: null, vitalStatus: "Alive",    survivalDays: 756,  hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
  { caseId: "TCGA-DD-AAW2", age: 69, gender: "M", stage: "Stage I",    grade: null, vitalStatus: "Alive",    survivalDays: 1855, hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
  { caseId: "TCGA-DD-AAD2", age: 66, gender: "M", stage: "Stage I",    grade: null, vitalStatus: "Alive",    survivalDays: 658,  hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
  { caseId: "TCGA-5C-A9VG", age: 58, gender: "M", stage: "Stage II",   grade: null, vitalStatus: "Alive",    survivalDays: 328,  hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
  { caseId: "TCGA-4G-AAZO", age: 71, gender: "F", stage: "Stage II",   grade: null, vitalStatus: "Alive",    survivalDays: 1177, hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
  { caseId: "TCGA-BC-A3KF", age: 66, gender: "F", stage: "Stage I",    grade: null, vitalStatus: "Alive",    survivalDays: 8,    hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
  { caseId: "TCGA-G3-A25X", age: 73, gender: "M", stage: "Stage II",   grade: null, vitalStatus: "Alive",    survivalDays: 1779, hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
  { caseId: "TCGA-RG-A7D4", age: 69, gender: "M", stage: "Stage II",   grade: null, vitalStatus: "Alive",    survivalDays: 1098, hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
  { caseId: "TCGA-G3-AAV4", age: 83, gender: "F", stage: "Stage I",    grade: null, vitalStatus: "Deceased", survivalDays: 27,   hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
  { caseId: "TCGA-DD-AAD0", age: 73, gender: "F", stage: "Stage I",    grade: null, vitalStatus: "Alive",    survivalDays: 137,  hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
  { caseId: "TCGA-DD-AAD3", age: 43, gender: "M", stage: "Stage I",    grade: null, vitalStatus: "Alive",    survivalDays: 1295, hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
  { caseId: "TCGA-2Y-A9GZ", age: 82, gender: "F", stage: "Stage II",   grade: null, vitalStatus: "Deceased", survivalDays: 848,  hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
  { caseId: "TCGA-DD-A1ED", age: 68, gender: "M", stage: "Stage I",    grade: null, vitalStatus: "Alive",    survivalDays: 2301, hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
  { caseId: "TCGA-DD-AAW0", age: 54, gender: "M", stage: "Stage I",    grade: null, vitalStatus: "Alive",    survivalDays: 2015, hbv: null, hcv: null, alcohol: null, afp: null, tumorSize: null },
];

export const snvClassification = [
  { class: "C>T Transition",   count: 2891, percentage: 40.9 },
  { class: "C>A Transversion", count: 1243, percentage: 17.6 },
  { class: "C>G Transversion", count: 589,  percentage: 8.3  },
  { class: "T>C Transition",   count: 1087, percentage: 15.4 },
  { class: "T>A Transversion", count: 712,  percentage: 10.1 },
  { class: "T>G Transversion", count: 544,  percentage: 7.7  },
];

export const datasetMetrics = {
  wgsFiles: 742,
  rnaSeqFiles: 424,
  methylationFiles: 379,
  clinicalFiles: 742,
  totalFileSizeGB: 18400,
  accessType: "Controlled Access (dbGaP)",
  embargo: "N/A — TCGA data is open-access summary level",
  grantNumber: "U24CA143867",
  primaryPublication: "TCGA Network, Hepatology, 2017",
};
