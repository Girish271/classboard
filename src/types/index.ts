export type Role = 'student' | 'teacher' | 'board' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;

  // New academic assignment
  departmentId?: string;
  academicGroupId?: string;
  sectionId?: string;

  // Keep temporarily for old data
  classId?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface AcademicGroup {
  id: string;
  departmentId: string;
  year: number;
  yearLabel: string;
}

export interface Section {
  id: string;
  academicGroupId: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;

  // New structure
  academicGroupId?: string;

  // Old structure — kept temporarily
  classId?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  section?: string;
}

export interface Material {
  id: string;
  name: string;
  originalName: string;
  url: string;

  // New structure
  departmentId?: string;
  academicGroupId?: string;
  sectionId?: string;

  subjectId: string;
  subjectName: string;

  // Keep temporarily for old data
  classId?: string;

  uploadedBy: string;
  uploadedAt: any;
  fileType: string;
  fileSize: number;
}