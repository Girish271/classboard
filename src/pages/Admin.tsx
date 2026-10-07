import { useState } from 'react';
import {
  useAcademicGroups,
  useAcademicSubjects,
  useDepartments,
  useSections,
  useClasses,
  useMaterials,
} from '../hooks/useRealtime';

import {
  addAcademicGroup,
  addDepartment,
  addGroupSubject,
  addSection,
  deleteMaterial,
} from '../services/data';

import MaterialCard from '../components/MaterialCard';

const YEARS = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
];

export default function Admin() {
  /* --------------------------------
     DEPARTMENTS
  -------------------------------- */

  const departments = useDepartments();

  const [departmentId, setDepartmentId] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');

  /* --------------------------------
     ACADEMIC YEAR
  -------------------------------- */

  const academicGroups = useAcademicGroups(departmentId);

  const [year, setYear] = useState('');

  /* --------------------------------
     SECTIONS
  -------------------------------- */

  const [sectionInput, setSectionInput] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const sections = useSections(selectedGroupId);

  /* --------------------------------
     SUBJECTS
  -------------------------------- */

  const [subjectName, setSubjectName] = useState('');

  const subjects = useAcademicSubjects(selectedGroupId);

  /* --------------------------------
     LEGACY MATERIALS
  -------------------------------- */

  const classes = useClasses();

  const [legacyClassId, setLegacyClassId] = useState('');

  const materials = useMaterials(
    legacyClassId || classes[0]?.id
  );

  /* --------------------------------
     CREATE DEPARTMENT
  -------------------------------- */

  async function createDepartment(e: React.FormEvent) {
    e.preventDefault();

    const name = departmentName.trim();
    const code = departmentCode.trim().toUpperCase();

    if (!name || !code) return;

    const existing = departments.find(
      (d) =>
        d.code.toLowerCase() === code.toLowerCase()
    );

    if (existing) {
      setDepartmentId(existing.id);
      setDepartmentName('');
      setDepartmentCode('');
      return;
    }

    const ref = await addDepartment({
      name,
      code,
    });

    setDepartmentId(ref.id);
    setDepartmentName('');
    setDepartmentCode('');
  }

  /* --------------------------------
     CREATE ACADEMIC YEAR
  -------------------------------- */

  async function createAcademicYear(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!departmentId || !year) return;

    const yearNumber = Number(year);

    const existing = academicGroups.find(
      (g) => g.year === yearNumber
    );

    if (existing) {
      setSelectedGroupId(existing.id);
      return;
    }

    const yearLabel =
      YEARS.find((x) => x.value === yearNumber)?.label ||
      `${yearNumber}th Year`;

    const ref = await addAcademicGroup({
      departmentId,
      year: yearNumber,
      yearLabel,
    });

    setSelectedGroupId(ref.id);
  }

  /* --------------------------------
     CREATE SECTIONS
  -------------------------------- */

  async function createSections(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!selectedGroupId) return;

    const names = sectionInput
      .split(/[,\s]+/)
      .map((x) => x.trim().toUpperCase())
      .filter(Boolean);

    for (const name of names) {
      const exists = sections.some(
        (section) =>
          section.name.toLowerCase() ===
          name.toLowerCase()
      );

      if (!exists) {
        await addSection({
          academicGroupId: selectedGroupId,
          name,
        });
      }
    }

    setSectionInput('');
  }

  /* --------------------------------
     CREATE SHARED SUBJECT
  -------------------------------- */

  async function createSubject(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const name = subjectName.trim();

    if (!selectedGroupId || !name) return;

    const exists = subjects.some(
      (subject) =>
        subject.name.toLowerCase() ===
        name.toLowerCase()
    );

    if (exists) {
      setSubjectName('');
      return;
    }

    await addGroupSubject({
      name,
      academicGroupId: selectedGroupId,
    });

    setSubjectName('');
  }

  /* --------------------------------
     SELECT ACADEMIC GROUP
  -------------------------------- */

  function handleYearChange(value: string) {
    setYear(value);

    const group = academicGroups.find(
      (g) => g.year === Number(value)
    );

    setSelectedGroupId(group?.id || '');
  }

  return (
    <div className="mx-auto max-w-6xl">

      {/* HEADER */}

      <div>
        <p className="text-sm font-bold text-brand">
          ADMIN
        </p>

        <h1 className="mt-1 text-3xl font-extrabold">
          ClassBoard setup
        </h1>

        <p className="mt-2 text-slate-500">
          Configure departments, academic years,
          sections and shared subjects.
        </p>
      </div>


      {/* =========================================
          DEPARTMENT
      ========================================= */}

      <section className="mt-7 card p-6">

        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">
              1. Department
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create your college departments.
            </p>
          </div>

          <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-brand">
            {departments.length} departments
          </span>
        </div>


        <div className="mt-5 grid gap-4 md:grid-cols-3">

          <select
            className="field"
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setSelectedGroupId('');
              setYear('');
            }}
          >
            <option value="">
              Select department
            </option>

            {departments.map((department) => (
              <option
                key={department.id}
                value={department.id}
              >
                {department.code} — {department.name}
              </option>
            ))}
          </select>


          <input
            className="field"
            placeholder="Department name"
            value={departmentName}
            onChange={(e) =>
              setDepartmentName(e.target.value)
            }
          />


          <div className="flex gap-2">
            <input
              className="field"
              placeholder="Code (CSE)"
              value={departmentCode}
              onChange={(e) =>
                setDepartmentCode(e.target.value)
              }
            />

            <button
              type="button"
              onClick={createDepartment}
              className="btn-primary whitespace-nowrap"
            >
              + Add
            </button>
          </div>

        </div>
      </section>


      {/* =========================================
          YEAR
      ========================================= */}

      <section className="mt-5 card p-6">

        <h2 className="text-xl font-bold">
          2. Academic Year
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Subjects will be shared across every
          section of this department and year.
        </p>


        <div className="mt-5 grid gap-4 md:grid-cols-2">

          <select
            className="field"
            value={year}
            disabled={!departmentId}
            onChange={(e) =>
              handleYearChange(e.target.value)
            }
          >
            <option value="">
              Select year
            </option>

            {YEARS.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>


          <button
            type="button"
            disabled={!departmentId || !year}
            onClick={createAcademicYear}
            className="btn-primary"
          >
            {academicGroups.some(
              (g) => g.year === Number(year)
            )
              ? 'Select Year'
              : 'Create Year'}
          </button>

        </div>


        {departmentId && academicGroups.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {academicGroups
              .sort((a, b) => a.year - b.year)
              .map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => {
                    setYear(String(group.year));
                    setSelectedGroupId(group.id);
                  }}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                    selectedGroupId === group.id
                      ? 'border-brand bg-mint text-brand'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {group.yearLabel}
                </button>
              ))}
          </div>
        )}

      </section>


      {/* =========================================
          SECTIONS + SUBJECTS
      ========================================= */}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">

        {/* SECTIONS */}

        <section className="card p-6">

          <h2 className="text-xl font-bold">
            3. Sections
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add multiple sections at once.
            Example: A, B, C, D
          </p>


          <form
            onSubmit={createSections}
            className="mt-5 flex gap-2"
          >
            <input
              className="field"
              disabled={!selectedGroupId}
              placeholder="A, B, C, D"
              value={sectionInput}
              onChange={(e) =>
                setSectionInput(e.target.value)
              }
            />

            <button
              className="btn-primary whitespace-nowrap"
              disabled={!selectedGroupId}
            >
              Add Sections
            </button>
          </form>


          <div className="mt-5 flex flex-wrap gap-3">

            {sections.length === 0 ? (
              <p className="text-sm text-slate-400">
                No sections created yet.
              </p>
            ) : (
              sections.map((section) => (
                <div
                  key={section.id}
                  className="grid h-12 w-12 place-items-center rounded-xl bg-mint font-bold text-brand"
                >
                  {section.name}
                </div>
              ))
            )}

          </div>

        </section>


        {/* SUBJECTS */}

        <section className="card p-6">

          <h2 className="text-xl font-bold">
            4. Shared Subjects
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            These subjects automatically belong to
            every section of this year.
          </p>


          <form
            onSubmit={createSubject}
            className="mt-5 flex gap-2"
          >
            <input
              className="field"
              disabled={!selectedGroupId}
              placeholder="Computer Networks"
              value={subjectName}
              onChange={(e) =>
                setSubjectName(e.target.value)
              }
            />

            <button
              className="btn-primary whitespace-nowrap"
              disabled={!selectedGroupId}
            >
              + Add
            </button>
          </form>


          <div className="mt-5 space-y-2">

            {subjects.length === 0 ? (
              <p className="text-sm text-slate-400">
                No subjects created yet.
              </p>
            ) : (
              subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium"
                >
                  {subject.name}
                </div>
              ))
            )}

          </div>

        </section>

      </div>


      {/* =========================================
          CURRENT STRUCTURE
      ========================================= */}

      {selectedGroupId && (
        <section className="mt-5 card overflow-hidden">

          <div className="border-b border-slate-200 p-6">

            <p className="text-sm font-bold text-brand">
              CURRENT STRUCTURE
            </p>

            <h2 className="mt-1 text-xl font-bold">

              {departments.find(
                (d) => d.id === departmentId
              )?.code}{' '}

              {academicGroups.find(
                (g) => g.id === selectedGroupId
              )?.yearLabel}

            </h2>

          </div>


          <div className="grid gap-6 p-6 md:grid-cols-2">

            <div>
              <p className="text-sm font-semibold text-slate-500">
                SECTIONS
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {sections.map((section) => (
                  <span
                    key={section.id}
                    className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold"
                  >
                    Section {section.name}
                  </span>
                ))}
              </div>
            </div>


            <div>
              <p className="text-sm font-semibold text-slate-500">
                SHARED SUBJECTS
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <span
                    key={subject.id}
                    className="rounded-lg bg-mint px-3 py-2 text-sm font-semibold text-brand"
                  >
                    {subject.name}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </section>
      )}


      {/* =========================================
          LEGACY MATERIALS
      ========================================= */}

      {classes.length > 0 && (
        <section className="mt-8">

          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">

            <div>
              <p className="text-xs font-bold text-slate-400">
                LEGACY DATA
              </p>

              <h2 className="text-xl font-bold">
                Existing Materials
              </h2>
            </div>


            <select
              className="field min-w-52"
              value={legacyClassId}
              onChange={(e) =>
                setLegacyClassId(e.target.value)
              }
            >
              <option value="">
                Select old class
              </option>

              {classes.map((x) => (
                <option
                  key={x.id}
                  value={x.id}
                >
                  {x.name}
                </option>
              ))}
            </select>

          </div>


          <div className="space-y-3">

            {materials.length === 0 ? (
              <div className="card p-6 text-center text-sm text-slate-500">
                No existing materials.
              </div>
            ) : (
              materials.map((m) => (
                <MaterialCard
                  key={m.id}
                  m={m}
                  onDelete={() =>
                    deleteMaterial(m.id)
                  }
                />
              ))
            )}

          </div>

        </section>
      )}


      {/* =========================================
          USERS
      ========================================= */}

      <section className="mt-8 card p-6">

        <p className="text-xs font-bold text-slate-400">
          ACCOUNT MANAGEMENT
        </p>

        <h2 className="mt-1 text-xl font-bold">
          Users
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Create Authentication users in Firebase
          Console, then add their matching role and
          academic assignment to the users collection.
        </p>

      </section>

    </div>
  );
}