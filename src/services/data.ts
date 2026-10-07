import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import { db } from '../lib/firebase';

import type {
  AcademicGroup,
  ClassRoom,
  Department,
  Material,
  Section,
  Subject,
} from '../types';


const needDb = () => {
  if (!db) {
    throw new Error(
      'Firebase configuration is missing. Please configure the environment variables described in STEPS.txt.'
    );
  }

  return db;
};


// ============================================================
// LEGACY DATA
// Keep these temporarily while we migrate Teacher/Student/Board
// ============================================================

export const listenClasses = (
  cb: (x: ClassRoom[]) => void
) =>
  onSnapshot(
    collection(needDb(), 'classes'),
    (s) =>
      cb(
        s.docs.map(
          (d) =>
            ({
              id: d.id,
              ...d.data(),
            }) as ClassRoom
        )
      )
  );


export const listenSubjects = (
  classId: string,
  cb: (x: Subject[]) => void
) =>
  onSnapshot(
    query(
      collection(needDb(), 'subjects'),
      where('classId', '==', classId)
    ),
    (s) =>
      cb(
        s.docs.map(
          (d) =>
            ({
              id: d.id,
              ...d.data(),
            }) as Subject
        )
      )
  );


// ============================================================
// MATERIALS
//
// Supports both:
//
// OLD:
// classId
//
// NEW:
// sectionId
// ============================================================

export const listenMaterials = (
  classId: string | undefined,
  cb: (x: Material[]) => void,
  subjectId?: string,
  sectionId?: string
) => {

  const filters: any[] = [];

  // Old ClassBoard data
  if (classId) {
    filters.push(
      where('classId', '==', classId)
    );
  }

  // New academic structure
  if (sectionId) {
    filters.push(
      where('sectionId', '==', sectionId)
    );
  }

  if (subjectId) {
    filters.push(
      where('subjectId', '==', subjectId)
    );
  }


  return onSnapshot(
    query(
      collection(needDb(), 'files'),
      ...filters
    ),
    (s) => {

      const materials = s.docs.map(
        (d) =>
          ({
            id: d.id,
            ...d.data(),
          }) as Material
      );


      // Sort locally instead of using Firestore orderBy.
      // This avoids needing another Firestore composite index
      // during the migration.

      materials.sort((a, b) => {

        const aTime =
          a.uploadedAt?.toMillis?.() || 0;

        const bTime =
          b.uploadedAt?.toMillis?.() || 0;

        return bTime - aTime;
      });


      cb(materials);
    }
  );
};


// ============================================================
// LEGACY WRITE FUNCTIONS
// ============================================================

export const addMaterial = (
  m: Omit<Material, 'id' | 'uploadedAt'>
) =>
  addDoc(
    collection(needDb(), 'files'),
    {
      ...m,
      uploadedAt: serverTimestamp(),
    }
  );


export const addClass = (
  x: Omit<ClassRoom, 'id'>
) =>
  addDoc(
    collection(needDb(), 'classes'),
    x
  );


export const addSubject = (
  x: Omit<Subject, 'id'>
) =>
  addDoc(
    collection(needDb(), 'subjects'),
    x
  );


export const deleteMaterial = (
  id: string
) =>
  deleteDoc(
    doc(needDb(), 'files', id)
  );


// ============================================================
// NEW ACADEMIC STRUCTURE
//
// Department
//      ↓
// Academic Group / Year
//      ↓
// Sections
//      ↓
// Shared Subjects
// ============================================================


export const listenDepartments = (
  cb: (x: Department[]) => void
) =>
  onSnapshot(
    collection(needDb(), 'departments'),
    (s) => {

      const departments =
        s.docs.map(
          (d) =>
            ({
              id: d.id,
              ...d.data(),
            }) as Department
        );

      departments.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      cb(departments);
    }
  );


export const listenAcademicGroups = (
  departmentId: string,
  cb: (x: AcademicGroup[]) => void
) =>
  onSnapshot(
    query(
      collection(
        needDb(),
        'academicGroups'
      ),
      where(
        'departmentId',
        '==',
        departmentId
      )
    ),
    (s) => {

      const groups =
        s.docs.map(
          (d) =>
            ({
              id: d.id,
              ...d.data(),
            }) as AcademicGroup
        );

      groups.sort(
        (a, b) => a.year - b.year
      );

      cb(groups);
    }
  );


export const listenSections = (
  academicGroupId: string,
  cb: (x: Section[]) => void
) =>
  onSnapshot(
    query(
      collection(
        needDb(),
        'sections'
      ),
      where(
        'academicGroupId',
        '==',
        academicGroupId
      )
    ),
    (s) => {

      const sections =
        s.docs.map(
          (d) =>
            ({
              id: d.id,
              ...d.data(),
            }) as Section
        );

      sections.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      cb(sections);
    }
  );


export const listenGroupSubjects = (
  academicGroupId: string,
  cb: (x: Subject[]) => void
) =>
  onSnapshot(
    query(
      collection(
        needDb(),
        'subjects'
      ),
      where(
        'academicGroupId',
        '==',
        academicGroupId
      )
    ),
    (s) => {

      const subjects =
        s.docs.map(
          (d) =>
            ({
              id: d.id,
              ...d.data(),
            }) as Subject
        );

      subjects.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      cb(subjects);
    }
  );


// ============================================================
// NEW ACADEMIC WRITE FUNCTIONS
// ============================================================

export const addDepartment = (
  x: Omit<Department, 'id'>
) =>
  addDoc(
    collection(
      needDb(),
      'departments'
    ),
    x
  );


export const addAcademicGroup = (
  x: Omit<AcademicGroup, 'id'>
) =>
  addDoc(
    collection(
      needDb(),
      'academicGroups'
    ),
    x
  );


export const addSection = (
  x: Omit<Section, 'id'>
) =>
  addDoc(
    collection(
      needDb(),
      'sections'
    ),
    x
  );


export const addGroupSubject = (
  x: Omit<Subject, 'id'>
) =>
  addDoc(
    collection(
      needDb(),
      'subjects'
    ),
    x
  );

  // ============================================================
// SERVER-SIDE MATERIAL DELETE
// Deletes both GitHub file + Firestore record
// ============================================================

export const deleteMaterialFromServer = async (
  id: string,
  token: string
) => {
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8787';

  const response = await fetch(
    `${baseUrl}/api/material/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
        'Failed to delete material.'
    );
  }

  return data;
};

