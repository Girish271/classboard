import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Maximize,
  RefreshCw,
  Settings2,
} from 'lucide-react';

import Logo from '../components/Logo';
import MaterialCard from '../components/MaterialCard';

import { useAuth } from '../hooks/useAuth';

import {
  useAcademicGroups,
  useAcademicSubjects,
  useDepartments,
  useMaterials,
  useSections,
} from '../hooks/useRealtime';


export default function Board() {

  const nav = useNavigate();

  const {
    profile,
    logout,
  } = useAuth();


  // ==========================================================
  // ACADEMIC DATA
  // ==========================================================

  const departments =
    useDepartments();


  const [departmentId, setDepartmentId] =
    useState(
      () =>
        localStorage.getItem(
          'classboard.boardDepartment'
        ) ||
        profile?.departmentId ||
        ''
    );


  const academicGroups =
    useAcademicGroups(
      departmentId
    );


  const [academicGroupId, setAcademicGroupId] =
    useState(
      () =>
        localStorage.getItem(
          'classboard.boardAcademicGroup'
        ) ||
        profile?.academicGroupId ||
        ''
    );


  const sections =
    useSections(
      academicGroupId
    );


  const [sectionId, setSectionId] =
    useState(
      () =>
        localStorage.getItem(
          'classboard.boardSection'
        ) ||
        profile?.sectionId ||
        ''
    );


  const [subjectId, setSubjectId] =
    useState('');


  const subjects =
    useAcademicSubjects(
      academicGroupId
    );


  const materials =
    useMaterials(
      undefined,
      subjectId || undefined,
      sectionId
    );


  // ==========================================================
  // KEEP PROFILE AS DEFAULT
  // ==========================================================

  useEffect(() => {

    if (
      !departmentId &&
      profile?.departmentId
    ) {
      setDepartmentId(
        profile.departmentId
      );
    }

  }, [
    departmentId,
    profile?.departmentId,
  ]);


  useEffect(() => {

    if (
      !academicGroupId &&
      profile?.academicGroupId
    ) {
      setAcademicGroupId(
        profile.academicGroupId
      );
    }

  }, [
    academicGroupId,
    profile?.academicGroupId,
  ]);


  useEffect(() => {

    if (
      !sectionId &&
      profile?.sectionId
    ) {
      setSectionId(
        profile.sectionId
      );
    }

  }, [
    sectionId,
    profile?.sectionId,
  ]);


  // ==========================================================
  // REMEMBER BOARD CONFIGURATION
  // ==========================================================

  useEffect(() => {

    if (departmentId) {
      localStorage.setItem(
        'classboard.boardDepartment',
        departmentId
      );
    }

  }, [departmentId]);


  useEffect(() => {

    if (academicGroupId) {
      localStorage.setItem(
        'classboard.boardAcademicGroup',
        academicGroupId
      );
    }

  }, [academicGroupId]);


  useEffect(() => {

    if (sectionId) {
      localStorage.setItem(
        'classboard.boardSection',
        sectionId
      );
    }

  }, [sectionId]);


  // ==========================================================
  // LIVE MATERIAL COUNT
  // ==========================================================

  const [seen, setSeen] =
    useState(0);


  useEffect(() => {

    if (
      materials.length > seen
    ) {
      setSeen(
        materials.length
      );
    }

  }, [
    materials.length,
    seen,
  ]);


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
  // FULLSCREEN
  // ==========================================================

  function fullscreen() {

    document.documentElement
      .requestFullscreen?.();

  }


  // ==========================================================
  // CHANGE DEPARTMENT
  // ==========================================================

  function changeDepartment(
    value: string
  ) {

    setDepartmentId(value);

    setAcademicGroupId('');

    setSectionId('');

    setSubjectId('');

  }


  // ==========================================================
  // CHANGE YEAR
  // ==========================================================

  function changeAcademicGroup(
    value: string
  ) {

    setAcademicGroupId(value);

    setSectionId('');

    setSubjectId('');

  }


  // ==========================================================
  // CHANGE SECTION
  // ==========================================================

  function changeSection(
    value: string
  ) {

    setSectionId(value);

    setSubjectId('');

  }


  // ==========================================================
  // RESET BOARD
  // ==========================================================

  function resetBoard() {

    localStorage.removeItem(
      'classboard.boardDepartment'
    );

    localStorage.removeItem(
      'classboard.boardAcademicGroup'
    );

    localStorage.removeItem(
      'classboard.boardSection'
    );

    setDepartmentId('');

    setAcademicGroupId('');

    setSectionId('');

    setSubjectId('');

  }


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white lg:p-10">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="flex flex-wrap items-center justify-between gap-5">

        <Logo large />


        <div className="flex flex-wrap items-center gap-3">

          {/* Department */}

          <select
            aria-label="Board department"
            className="rounded-xl bg-white px-4 py-3 text-lg font-bold text-ink"
            value={departmentId}
            onChange={(e) =>
              changeDepartment(
                e.target.value
              )
            }
          >

            <option value="">
              Department
            </option>

            {departments.map(
              (department) => (
                <option
                  key={department.id}
                  value={department.id}
                >
                  {department.code}
                </option>
              )
            )}

          </select>


          {/* Year */}

          <select
            aria-label="Board academic year"
            className="rounded-xl bg-white px-4 py-3 text-lg font-bold text-ink"
            value={academicGroupId}
            disabled={!departmentId}
            onChange={(e) =>
              changeAcademicGroup(
                e.target.value
              )
            }
          >

            <option value="">
              Year
            </option>

            {academicGroups.map(
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


          {/* Section */}

          <select
            aria-label="Board section"
            className="rounded-xl bg-white px-4 py-3 text-lg font-bold text-ink"
            value={sectionId}
            disabled={!academicGroupId}
            onChange={(e) =>
              changeSection(
                e.target.value
              )
            }
          >

            <option value="">
              Section
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


          {/* Fullscreen */}

          <button
            className="btn bg-white/10"
            onClick={fullscreen}
          >
            <Maximize />
            Full screen
          </button>


          {/* Reset */}

          <button
            className="btn bg-white/10"
            onClick={resetBoard}
            title="Change board classroom"
          >
            <Settings2 />
          </button>


          {/* Sign out */}

          <button
            className="btn bg-white/10"
            onClick={logout}
          >
            Sign out
          </button>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto mt-10 max-w-7xl">


        {/* ===================================================
            TITLE
        =================================================== */}

        <div className="flex flex-wrap items-center justify-between gap-5">

          <div>

            <p className="text-lg text-emerald-300">
              LIVE · updates automatically
            </p>

            <h1 className="mt-1 text-4xl font-black lg:text-6xl">
              Class Materials
            </h1>


            {selectedDepartment &&
              selectedGroup &&
              selectedSection && (

                <p className="mt-3 text-lg text-slate-400">

                  {selectedDepartment.code}
                  {' · '}
                  {selectedGroup.yearLabel}
                  {' · '}
                  Section{' '}
                  {selectedSection.name}

                </p>

              )}

          </div>


          {/* =================================================
              SUBJECT FILTER
          ================================================= */}

          {sectionId && (
            <div className="flex max-w-full gap-3 overflow-auto pb-2">

              <button
                onClick={() =>
                  setSubjectId('')
                }
                className={`btn min-h-14 text-lg ${
                  !subjectId
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-white/10'
                }`}
              >
                All
              </button>


              {subjects.map(
                (subject) => (

                  <button
                    key={subject.id}
                    onClick={() =>
                      setSubjectId(
                        subject.id
                      )
                    }
                    className={`btn min-h-14 whitespace-nowrap text-lg ${
                      subjectId === subject.id
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-white/10'
                    }`}
                  >
                    {subject.name}
                  </button>

                )
              )}

            </div>
          )}

        </div>


        {/* ===================================================
            MATERIALS
        =================================================== */}

        <div className="mt-8 space-y-5 text-ink">

          {!sectionId ? (

            <div className="rounded-3xl bg-white/10 p-16 text-center text-2xl text-white">

              <Settings2
                className="mx-auto mb-4"
                size={42}
              />

              <p className="font-bold">
                Select the classroom
              </p>

              <p className="mt-2 text-base text-slate-400">
                Choose department, year and section.
                This board will remember your selection.
              </p>

            </div>

          ) : materials.length ? (

            materials.map(
              (material) => (

                <div
                  key={material.id}
                  onClick={() =>
                    nav(
                      `/board/viewer?id=${material.id}`
                    )
                  }
                  className="cursor-pointer"
                >

                  <MaterialCard
                    m={material}
                    big
                  />

                </div>

              )
            )

          ) : (

            <div className="rounded-3xl bg-white/10 p-16 text-center text-2xl text-white">

              <RefreshCw
                className="mx-auto mb-4"
                size={42}
              />

              <p>
                No materials yet.
              </p>

              <p className="mt-2 text-base text-slate-400">
                New uploads will appear here automatically.
              </p>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}