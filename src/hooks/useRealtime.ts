import { useEffect, useState } from 'react';

import {
  listenClasses,
  listenMaterials,
  listenSubjects,
  listenDepartments,
  listenAcademicGroups,
  listenSections,
  listenGroupSubjects,
} from '../services/data';

import type {
  AcademicGroup,
  ClassRoom,
  Department,
  Material,
  Section,
  Subject,
} from '../types';


// ============================================================
// LEGACY
// ============================================================

export const useClasses = () => {
  const [items, setItems] = useState<ClassRoom[]>([]);

  useEffect(() => {
    try {
      return listenClasses(setItems);
    } catch {
      return;
    }
  }, []);

  return items;
};


export const useSubjects = (
  classId?: string
) => {
  const [items, setItems] = useState<Subject[]>([]);

  useEffect(() => {
    if (!classId) {
      setItems([]);
      return;
    }

    try {
      return listenSubjects(
        classId,
        setItems
      );
    } catch {
      return;
    }
  }, [classId]);

  return items;
};


// ============================================================
// MATERIALS
//
// Supports:
//
// OLD:
// classId + subjectId
//
// NEW:
// sectionId + subjectId
// ============================================================

export const useMaterials = (
  classId?: string,
  subjectId?: string,
  sectionId?: string
) => {

  const [items, setItems] =
    useState<Material[]>([]);


  useEffect(() => {

    // No class AND no section means
    // there is nothing to listen to.
    if (!classId && !sectionId) {
      setItems([]);
      return;
    }


    try {

      return listenMaterials(
        classId,
        setItems,
        subjectId,
        sectionId
      );

    } catch {

      return;
    }

  }, [
    classId,
    subjectId,
    sectionId,
  ]);


  return items;
};


// ============================================================
// NEW ACADEMIC STRUCTURE
// ============================================================

export const useDepartments = () => {

  const [items, setItems] =
    useState<Department[]>([]);


  useEffect(() => {

    try {

      return listenDepartments(
        setItems
      );

    } catch {

      return;
    }

  }, []);


  return items;
};


export const useAcademicGroups = (
  departmentId?: string
) => {

  const [items, setItems] =
    useState<AcademicGroup[]>([]);


  useEffect(() => {

    if (!departmentId) {
      setItems([]);
      return;
    }


    try {

      return listenAcademicGroups(
        departmentId,
        setItems
      );

    } catch {

      return;
    }

  }, [departmentId]);


  return items;
};


export const useSections = (
  academicGroupId?: string
) => {

  const [items, setItems] =
    useState<Section[]>([]);


  useEffect(() => {

    if (!academicGroupId) {
      setItems([]);
      return;
    }


    try {

      return listenSections(
        academicGroupId,
        setItems
      );

    } catch {

      return;
    }

  }, [academicGroupId]);


  return items;
};


export const useAcademicSubjects = (
  academicGroupId?: string
) => {

  const [items, setItems] =
    useState<Subject[]>([]);


  useEffect(() => {

    if (!academicGroupId) {
      setItems([]);
      return;
    }


    try {

      return listenGroupSubjects(
        academicGroupId,
        setItems
      );

    } catch {

      return;
    }

  }, [academicGroupId]);


  return items;
};