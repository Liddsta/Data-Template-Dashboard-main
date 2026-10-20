// Simulated hospital data
export const hospitalData = {
  overview: {
    totalPatients: 50,
    totalAppointments: 200,
    completedAppointments: 46,
    totalRevenue: 551250,
    outstandingPayments: 184610,
    averageTreatmentCost: 3000,
  },

  beds: {
    total: 120,
    occupied: 87,
    available: 33,
    averageStayDays: 4.2,
    turnoverRate: 85,
    wards: [
      { name: 'General Ward', total: 40, occupied: 32, avgStay: 3.5 },
      { name: 'ICU', total: 20, occupied: 18, avgStay: 7.2 },
      { name: 'Pediatrics', total: 25, occupied: 15, avgStay: 3.8 },
      { name: 'Maternity', total: 20, occupied: 14, avgStay: 2.5 },
      { name: 'Surgery Recovery', total: 15, occupied: 8, avgStay: 5.1 },
    ]
  },

  appointmentsOverTime: [
    { id: 1, time: '8:00 AM', count: 3 },
    { id: 2, time: '8:30 AM', count: 7 },
    { id: 3, time: '9:00 AM', count: 4 },
    { id: 4, time: '9:30 AM', count: 4 },
    { id: 5, time: '10:00 AM', count: 6 },
    { id: 6, time: '10:30 AM', count: 3 },
    { id: 7, time: '11:00 AM', count: 4 },
    { id: 8, time: '11:30 AM', count: 9 },
    { id: 9, time: '12:00 PM', count: 1 },
    { id: 10, time: '12:30 PM', count: 4 },
    { id: 11, time: '1:00 PM', count: 3 },
    { id: 12, time: '1:30 PM', count: 7 },
    { id: 13, time: '2:00 PM', count: 7 },
    { id: 14, time: '2:30 PM', count: 3 },
    { id: 15, time: '3:00 PM', count: 5 },
    { id: 16, time: '3:30 PM', count: 8 },
    { id: 17, time: '4:00 PM', count: 10 },
    { id: 18, time: '4:30 PM', count: 8 },
    { id: 19, time: '5:00 PM', count: 2 },
    { id: 20, time: '5:30 PM', count: 5 },
    { id: 21, time: '6:00 PM', count: 1 },
    { id: 22, time: '6:30 PM', count: 8 },
    { id: 23, time: '7:00 PM', count: 3 },
  ],

  revenueOverTime: [
    { id: 1, month: 'Jan', revenue: 60000 },
    { id: 2, month: 'Feb', revenue: 35000 },
    { id: 3, month: 'Mar', revenue: 48000 },
    { id: 4, month: 'Apr', revenue: 68000 },
    { id: 5, month: 'May', revenue: 50000 },
    { id: 6, month: 'Jun', revenue: 55000 },
    { id: 7, month: 'Jul', revenue: 40000 },
    { id: 8, month: 'Aug', revenue: 42000 },
    { id: 9, month: 'Sep', revenue: 32000 },
    { id: 10, month: 'Oct', revenue: 45000 },
    { id: 11, month: 'Nov', revenue: 55000 },
    { id: 12, month: 'Dec', revenue: 28000 },
  ],

  patients: [
    { id: 'P012', firstName: 'Laura', lastName: 'Davis', gender: 'F', age: 35, insurance: 'MedCare Plus', email: 'laura.davis@mail.com', status: 'Active' },
    { id: 'P014', firstName: 'Alex', lastName: 'Taylor', gender: 'M', age: 58, insurance: 'MedCare Plus', email: 'alex.taylor@mail.com', status: 'Active' },
    { id: 'P009', firstName: 'Laura', lastName: 'Davis', gender: 'M', age: 55, insurance: 'PulseSecure', email: 'laura.davis@mail.com', status: 'Discharged' },
    { id: 'P016', firstName: 'Michael', lastName: 'Taylor', gender: 'M', age: 26, insurance: 'PulseSecure', email: 'michael.taylor@mail.com', status: 'Active' },
    { id: 'P011', firstName: 'Emily', lastName: 'Jones', gender: 'F', age: 60, insurance: 'MedCare Plus', email: 'emily.jones@mail.com', status: 'Active' },
    { id: 'P017', firstName: 'Jane', lastName: 'Jones', gender: 'M', age: 35, insurance: 'WellnessCorp', email: 'jane.jones@mail.com', status: 'Active' },
    { id: 'P030', firstName: 'Emily', lastName: 'Moore', gender: 'M', age: 62, insurance: 'PulseSecure', email: 'emily.moore@mail.com', status: 'Active' },
    { id: 'P022', firstName: 'John', lastName: 'Brown', gender: 'M', age: 71, insurance: 'MedCare Plus', email: 'john.brown@mail.com', status: 'Active' },
    { id: 'P020', firstName: 'Jane', lastName: 'Moore', gender: 'F', age: 23, insurance: 'MedCare Plus', email: 'jane.moore@mail.com', status: 'Active' },
    { id: 'P021', firstName: 'Michael', lastName: 'Wilson', gender: 'M', age: 24, insurance: 'WellnessCorp', email: 'michael.wilson@mail.com', status: 'Discharged' },
    { id: 'P037', firstName: 'Robert', lastName: 'Williams', gender: 'M', age: 27, insurance: 'HealthIndia', email: 'robert.williams@mail.com', status: 'Active' },
    { id: 'P040', firstName: 'Emily', lastName: 'Williams', gender: 'M', age: 54, insurance: 'PulseSecure', email: 'emily.williams@mail.com', status: 'Active' },
    { id: 'P032', firstName: 'Alex', lastName: 'Moore', gender: 'M', age: 45, insurance: 'MedCare Plus', email: 'alex.moore@mail.com', status: 'Active' },
    { id: 'P047', firstName: 'Jane', lastName: 'Moore', gender: 'M', age: 31, insurance: 'WellnessCorp', email: 'jane.moore@mail.com', status: 'Active' },
    { id: 'P039', firstName: 'Jane', lastName: 'Wilson', gender: 'F', age: 76, insurance: 'PulseSecure', email: 'jane.wilson@mail.com', status: 'Active' },
  ],

  genderDistribution: [
    { name: 'Male', value: 28, color: '#3B82F6' },
    { name: 'Female', value: 22, color: '#6366F1' },
  ],

  ageDistribution: [
    { range: '20-25', count: 3 },
    { range: '26-30', count: 5 },
    { range: '31-35', count: 8 },
    { range: '36-40', count: 4 },
    { range: '41-45', count: 3 },
    { range: '46-50', count: 6 },
    { range: '51-55', count: 5 },
    { range: '56-60', count: 7 },
    { range: '61-65', count: 4 },
    { range: '66-70', count: 3 },
    { range: '71-75', count: 1 },
    { range: '76-80', count: 1 },
  ],

  insuranceBreakdown: [
    { name: 'MedCare Plus', value: 18 },
    { name: 'WellnessCorp', value: 15 },
    { name: 'PulseSecure', value: 12 },
    { name: 'HealthIndia', value: 5 },
  ],

  doctors: [
    { name: 'Dr. Davis', specialization: 'Pediatrics', experience: 5, appointments: 30, patients: 25 },
    { name: 'Dr. Smith', specialization: 'Dermatology', experience: 18, appointments: 20, patients: 22 },
    { name: 'Dr. Taylor', specialization: 'Oncology', experience: 25, appointments: 20, patients: 24 },
    { name: 'Dr. Brown', specialization: 'Pediatrics', experience: 15, appointments: 10, patients: 15 },
    { name: 'Dr. Jones', specialization: 'Dermatology', experience: 22, appointments: 10, patients: 21 },
    { name: 'Dr. Wilson', specialization: 'Pediatrics', experience: 28, appointments: 10, patients: 30 },
  ],

  doctorWorkload: [
    { specialization: 'Pediatrics', count: 98 },
    { specialization: 'Dermatology', count: 72 },
    { specialization: 'Oncology', count: 30 },
  ],

  appointments: [
    { id: 'A001', patient: 'Laura Davis', doctor: 'Dr. Smith', date: '2026-05-08', time: '10:00 AM', status: 'Scheduled', type: 'Check-up' },
    { id: 'A002', patient: 'Alex Taylor', doctor: 'Dr. Jones', date: '2026-05-08', time: '11:30 AM', status: 'Scheduled', type: 'Follow-up' },
    { id: 'A003', patient: 'Emily Jones', doctor: 'Dr. Davis', date: '2026-05-07', time: '2:00 PM', status: 'Completed', type: 'Consultation' },
    { id: 'A004', patient: 'John Brown', doctor: 'Dr. Wilson', date: '2026-05-07', time: '9:00 AM', status: 'Completed', type: 'Treatment' },
    { id: 'A005', patient: 'Jane Moore', doctor: 'Dr. Taylor', date: '2026-05-09', time: '3:00 PM', status: 'Scheduled', type: 'Screening' },
    { id: 'A006', patient: 'Michael Wilson', doctor: 'Dr. Brown', date: '2026-05-06', time: '4:00 PM', status: 'Cancelled', type: 'Check-up' },
    { id: 'A007', patient: 'Robert Williams', doctor: 'Dr. Smith', date: '2026-05-05', time: '1:00 PM', status: 'No-show', type: 'Consultation' },
    { id: 'A008', patient: 'Emily Williams', doctor: 'Dr. Davis', date: '2026-05-10', time: '10:30 AM', status: 'Scheduled', type: 'Follow-up' },
  ],

  appointmentTrends: [
    { month: 'Jan', scheduled: 25, completed: 18, cancelled: 4, noShow: 3 },
    { month: 'Feb', scheduled: 22, completed: 16, cancelled: 3, noShow: 3 },
    { month: 'Mar', scheduled: 28, completed: 22, cancelled: 3, noShow: 3 },
    { month: 'Apr', scheduled: 30, completed: 25, cancelled: 3, noShow: 2 },
    { month: 'May', scheduled: 26, completed: 19, cancelled: 4, noShow: 3 },
    { month: 'Jun', scheduled: 24, completed: 18, cancelled: 3, noShow: 3 },
    { month: 'Jul', scheduled: 22, completed: 16, cancelled: 3, noShow: 3 },
    { month: 'Aug', scheduled: 21, completed: 15, cancelled: 3, noShow: 3 },
    { month: 'Sep', scheduled: 19, completed: 11, cancelled: 4, noShow: 4 },
    { month: 'Oct', scheduled: 23, completed: 17, cancelled: 3, noShow: 3 },
    { month: 'Nov', scheduled: 25, completed: 17, cancelled: 4, noShow: 4 },
    { month: 'Dec', scheduled: 20, completed: 12, cancelled: 4, noShow: 4 },
  ],

  treatments: [
    { name: 'Chemotherapy', count: 52, avgCost: 2500, totalRevenue: 130000 },
    { name: 'X-Ray', count: 42, avgCost: 2200, totalRevenue: 92400 },
    { name: 'ECG', count: 38, avgCost: 1800, totalRevenue: 68400 },
    { name: 'MRI', count: 35, avgCost: 2300, totalRevenue: 80500 },
    { name: 'Physiotherapy', count: 33, avgCost: 2100, totalRevenue: 69300 },
  ],

  treatmentCostDistribution: Array.from({ length: 50 }, (_, i) => ({
    cost: Math.floor(Math.random() * 5000),
  })),

  treatmentsOverTime: [
    { month: 'Jan', count: 20 },
    { month: 'Feb', count: 14 },
    { month: 'Mar', count: 18 },
    { month: 'Apr', count: 25 },
    { month: 'May', count: 19 },
    { month: 'Jun', count: 18 },
    { month: 'Jul', count: 16 },
    { month: 'Aug', count: 15 },
    { month: 'Sep', count: 11 },
    { month: 'Oct', count: 15 },
    { month: 'Nov', count: 17 },
    { month: 'Dec', count: 12 },
  ],

  revenueByPaymentMethod: [
    { name: 'Credit Card', value: 220500, color: '#3B82F6' },
    { name: 'Insurance', value: 198375, color: '#6366F1' },
    { name: 'Cash', value: 132375, color: '#FBBF24' },
  ],

  paymentStatus: [
    { name: 'Paid', value: 366640, color: '#FBBF24' },
    { name: 'Pending', value: 132375, color: '#3B82F6' },
    { name: 'Failed', value: 52235, color: '#6366F1' },
  ],
};
