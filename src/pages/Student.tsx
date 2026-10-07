import { useState } from 'react';

import MaterialCard from '../components/MaterialCard';

import {
  useAcademicGroups,
  useAcademicSubjects,
  useDepartments,
  useMaterials,
  useSections,
} from '../hooks/useRealtime';

export default function Student() {

  // ==========================================================
  // DEPARTMENT
  // ==========================================================

  const departments = useDepartments();

  const [departmentId, setDepartmentId] =
    useState('');


  // ==========================================================
  // YEAR
  // ==========================================================

  const academicGroups =
    useAcademicGroups(
      departmentId
    );

  const [academicGroupId, setAcademicGroupId] =
    useState('');


  // ==========================================================
  // SECTION
  // ==========================================================

  const sections =
    useSections(
      academicGroupId
    );

  const [sectionId, setSectionId] =
    useState('');


  // ==========================================================
  // SUBJECT
  // ==========================================================

  const subjects =
    useAcademicSubjects(
      academicGroupId
    );

  const [subjectId, setSubjectId] =
    useState('');


  // ==========================================================
  // MATERIALS
  // ==========================================================

  const materials =
    useMaterials(
      undefined,
      subjectId || undefined,
      sectionId
    );


  // ==========================================================
  // SELECTION HANDLERS
  // ==========================================================

  function changeDepartment(
    value: string
  ) {

    setDepartmentId(value);

    setAcademicGroupId('');

    setSectionId('');

    setSubjectId('');
  }


  function changeAcademicGroup(
    value: string
  ) {

    setAcademicGroupId(value);

    setSectionId('');

    setSubjectId('');
  }


  function changeSection(
    value: string
  ) {

    setSectionId(value);

    setSubjectId('');
  }


  function changeSubject(
    value: string
  ) {

    setSubjectId(value);
  }


  // ==========================================================
  // SELECTED NAMES
  // ==========================================================

  const selectedDepartment =
    departments.find(
      (x) =>
        x.id === departmentId
    );


  const selectedGroup =
    academicGroups.find(
      (x) =>
        x.id === academicGroupId
    );


  const selectedSection =
    sections.find(
      (x) =>
        x.id === sectionId
    );


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="mx-auto max-w-5xl">

      {/* HEADER */}

      <p className="text-sm font-bold text-brand">
        STUDENT
      </p>

      <h1 className="mt-1 text-3xl font-extrabold">
        Class Materials
      </h1>

      <p className="mt-2 text-slate-500">
        Find materials for any department, year,
        section and subject.
      </p>


      {/* =====================================================
          CLASSIFICATION
      ===================================================== */}

      <section className="mt-7 card p-6">

        <div>

          <h2 className="text-xl font-bold">
            Find your classroom
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select the academic classification to
            view its materials.
          </p>

        </div>


        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* DEPARTMENT */}

          <label>

            <span className="label">
              Department
            </span>

            <select
              className="field"
              value={departmentId}
              onChange={(e) =>
                changeDepartment(
                  e.target.value
                )
              }
            >

              <option value="">
                Select department
              </option>

              {departments.map(
                (department) => (

                  <option
                    key={department.id}
                    value={department.id}
                  >
                    {department.code} —{' '}
                    {department.name}
                  </option>

                )
              )}

            </select>

          </label>


          {/* YEAR */}

          <label>

            <span className="label">
              Academic Year
            </span>

            <select
              className="field"
              value={academicGroupId}
              disabled={!departmentId}
              onChange={(e) =>
                changeAcademicGroup(
                  e.target.value
                )
              }
            >

              <option value="">
                Select year
              </option>

              {academicGroups
                .sort(
                  (a, b) =>
                    a.year - b.year
                )
                .map(
                  (group) => (

                    <option
                      key={group.id}
                      value={group.id}
                    >
                      {group.yearLabel}
                    </option>

                  )
                )}

            </select>

          </label>


          {/* SECTION */}

          <label>

            <span className="label">
              Section
            </span>

            <select
              className="field"
              value={sectionId}
              disabled={!academicGroupId}
              onChange={(e) =>
                changeSection(
                  e.target.value
                )
              }
            >

              <option value="">
                Select section
              </option>

              {sections.map(
                (section) => (

                  <option
                    key={section.id}
                    value={section.id}
                  >
                    Section {section.name}
                  </option>

                )
              )}

            </select>

          </label>


          {/* SUBJECT */}

          <label>

            <span className="label">
              Subject
            </span>

            <select
              className="field"
              value={subjectId}
              disabled={!academicGroupId}
              onChange={(e) =>
                changeSubject(
                  e.target.value
                )
              }
            >

              <option value="">
                All subjects
              </option>

              {subjects.map(
                (subject) => (

                  <option
                    key={subject.id}
                    value={subject.id}
                  >
                    {subject.name}
                  </option>

                )
              )}

            </select>

          </label>

        </div>


        {/* CURRENT SELECTION */}

        {selectedDepartment &&
          selectedGroup &&
          selectedSection && (

            <div className="mt-5 rounded-xl bg-mint p-4">

              <p className="text-sm font-bold text-brand">
                SHOWING MATERIALS FOR
              </p>

              <p className="mt-1 font-semibold text-slate-700">

                {selectedDepartment.code}
                {' · '}
                {selectedGroup.yearLabel}
                {' · '}
                Section{' '}
                {selectedSection.name}

                {subjectId && (
                  <>
                    {' · '}
                    {
                      subjects.find(
                        (x) =>
                          x.id === subjectId
                      )?.name
                    }
                  </>
                )}

              </p>

            </div>

          )}

      </section>


      {/* =====================================================
          MATERIALS
      ===================================================== */}

      <section className="mt-8">

        <div className="mb-4">

          <h2 className="text-xl font-bold">
            Materials
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Recently uploaded material for the
            selected classroom.
          </p>

        </div>


        {!sectionId ? (

          <div className="card p-10 text-center text-slate-500">

            <p className="font-semibold">
              Select a department, year and section.
            </p>

            <p className="mt-2 text-sm">
              Your materials will appear here.
            </p>

          </div>

        ) : materials.length ? (

          <div className="space-y-3">

            {materials.map(
              (material) => (

                <MaterialCard
                  key={material.id}
                  m={material}
                />

              )
            )}

          </div>

        ) : (

          <div className="card p-10 text-center text-slate-500">

            <p className="font-semibold">
              No materials found.
            </p>

            <p className="mt-2 text-sm">
              Your teacher hasn't uploaded anything
              for this classroom yet.
            </p>

          </div>

        )}

      </section>

    </div>
  );
}