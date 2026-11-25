// Static mock data for UI demonstration only.
// No backend / API calls — replace with real data when wiring up a server.

export const adminUser = {
  name: 'Priya Sharma',
  role: 'Super Admin',
  avatarInitials: 'PS',
};

export const statCards = [
  { id: 'revenue', title: "Today's Revenue", value: '₹2,450', icon: 'money' },
  { id: 'jobs', title: "Today's Jobs", value: '48', icon: 'print' },
  { id: 'success', title: 'Success Rate', value: '98%', icon: 'check' },
  { id: 'printers', title: 'Active Printers', value: '3', icon: 'printer' },
];

export const revenueLast7Days = [
  { day: 'Mon', revenue: 1800 },
  { day: 'Tue', revenue: 2200 },
  { day: 'Wed', revenue: 1650 },
  { day: 'Thu', revenue: 2900 },
  { day: 'Fri', revenue: 2450 },
  { day: 'Sat', revenue: 3100 },
  { day: 'Sun', revenue: 1200 },
];

export const recentJobs = [
  { id: 1, student: 'Arjun Mehta', file: 'Assignment_Unit3.pdf', pages: 12, amount: '₹24', status: 'Completed', time: '10:24 AM' },
  { id: 2, student: 'Sneha Rao', file: 'Lab_Report_Final.docx', pages: 8, amount: '₹40', status: 'Printing', time: '10:31 AM' },
  { id: 3, student: 'Karthik Iyer', file: 'Resume_2026.pdf', pages: 2, amount: '₹10', status: 'Pending', time: '10:36 AM' },
  { id: 4, student: 'Divya Nair', file: 'Thesis_Chapter5.pdf', pages: 34, amount: '₹170', status: 'Completed', time: '10:42 AM' },
  { id: 5, student: 'Rohit Verma', file: 'Notes_Scanned.pdf', pages: 5, amount: '₹25', status: 'Failed', time: '10:48 AM' },
  { id: 6, student: 'Ananya Das', file: 'Project_Poster.pdf', pages: 1, amount: '₹8', status: 'Completed', time: '10:55 AM' },
];

export const printerStatusSummary = [
  { id: 'p1', name: 'Printer 1', location: 'Library — Floor 1', online: true },
  { id: 'p2', name: 'Printer 2', location: 'Block A — Ground Floor', online: true },
  { id: 'p3', name: 'Printer 3', location: 'Block C — Floor 2', online: false },
];

export const quickPricingPreview = [
  { label: 'A4 B&W', price: '₹2' },
  { label: 'A4 Colour', price: '₹5' },
  { label: 'A3 B&W', price: '₹4' },
  { label: 'A3 Colour', price: '₹8' },
];

export const pricingRows = [
  { id: 1, paperSize: 'A4', colorMode: 'B&W', printSide: 'Single', price: '₹2.00' },
  { id: 2, paperSize: 'A4', colorMode: 'B&W', printSide: 'Double', price: '₹3.50' },
  { id: 3, paperSize: 'A4', colorMode: 'Colour', printSide: 'Single', price: '₹5.00' },
  { id: 4, paperSize: 'A4', colorMode: 'Colour', printSide: 'Double', price: '₹9.00' },
  { id: 5, paperSize: 'A3', colorMode: 'B&W', printSide: 'Single', price: '₹4.00' },
  { id: 6, paperSize: 'A3', colorMode: 'B&W', printSide: 'Double', price: '₹7.00' },
  { id: 7, paperSize: 'A3', colorMode: 'Colour', printSide: 'Single', price: '₹8.00' },
  { id: 8, paperSize: 'A3', colorMode: 'Colour', printSide: 'Double', price: '₹15.00' },
];

export const transactions = [
  { id: 1, student: 'Arjun Mehta', file: 'Assignment_Unit3.pdf', pages: 12, copies: 1, amount: '₹24', paymentStatus: 'Paid', printStatus: 'Completed', time: 'Today, 10:24 AM' },
  { id: 2, student: 'Sneha Rao', file: 'Lab_Report_Final.docx', pages: 8, copies: 2, amount: '₹80', paymentStatus: 'Paid', printStatus: 'Printing', time: 'Today, 10:31 AM' },
  { id: 3, student: 'Karthik Iyer', file: 'Resume_2026.pdf', pages: 2, copies: 1, amount: '₹10', paymentStatus: 'Pending', printStatus: 'Pending', time: 'Today, 10:36 AM' },
  { id: 4, student: 'Divya Nair', file: 'Thesis_Chapter5.pdf', pages: 34, copies: 1, amount: '₹170', paymentStatus: 'Paid', printStatus: 'Completed', time: 'Today, 10:42 AM' },
  { id: 5, student: 'Rohit Verma', file: 'Notes_Scanned.pdf', pages: 5, copies: 1, amount: '₹25', paymentStatus: 'Refunded', printStatus: 'Failed', time: 'Today, 10:48 AM' },
  { id: 6, student: 'Meera Pillai', file: 'Seminar_Slides.pdf', pages: 20, copies: 3, amount: '₹300', paymentStatus: 'Paid', printStatus: 'Completed', time: 'Yesterday, 4:12 PM' },
  { id: 7, student: 'Vikram Shah', file: 'Circuit_Diagram.pdf', pages: 3, copies: 1, amount: '₹24', paymentStatus: 'Paid', printStatus: 'Completed', time: 'Yesterday, 2:05 PM' },
];

export const printers = [
  { id: 'p1', name: 'Printer 1', location: 'Library — Floor 1', status: 'Online', queue: 4 },
  { id: 'p2', name: 'Printer 2', location: 'Block A — Ground Floor', status: 'Online', queue: 2 },
  { id: 'p3', name: 'Printer 3', location: 'Block C — Floor 2', status: 'Offline', queue: 0 },
  { id: 'p4', name: 'Printer 4', location: 'Hostel Common Room', status: 'Busy', queue: 7 },
];

export const students = [
  { id: 1, name: 'Arjun Mehta', admissionNo: 'ADM2023101', department: 'Computer Science', phone: '+91 98765 43210', status: 'Active' },
  { id: 2, name: 'Sneha Rao', admissionNo: 'ADM2023087', department: 'Electronics', phone: '+91 98765 22110', status: 'Active' },
  { id: 3, name: 'Karthik Iyer', admissionNo: 'ADM2022045', department: 'Mechanical', phone: '+91 91234 56780', status: 'Disabled' },
  { id: 4, name: 'Divya Nair', admissionNo: 'ADM2023112', department: 'Information Tech', phone: '+91 99887 76655', status: 'Active' },
  { id: 5, name: 'Rohit Verma', admissionNo: 'ADM2021009', department: 'Civil', phone: '+91 90909 80808', status: 'Active' },
  { id: 6, name: 'Meera Pillai', admissionNo: 'ADM2023056', department: 'Computer Science', phone: '+91 93456 12378', status: 'Active' },
];

export const reportStats = [
  { id: 'daily', title: 'Daily Revenue', value: '₹2,450' },
  { id: 'weekly', title: 'Weekly Revenue', value: '₹15,820' },
  { id: 'monthly', title: 'Monthly Revenue', value: '₹64,300' },
  { id: 'totalJobs', title: 'Total Jobs', value: '1,284' },
  { id: 'completedJobs', title: 'Completed Jobs', value: '1,190' },
  { id: 'cancelledJobs', title: 'Cancelled Jobs', value: '34' },
];
