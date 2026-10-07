import { useState } from 'react';

import UploadPanel from '../components/UploadPanel';
import MaterialCard from '../components/MaterialCard';

import { useAuth } from '../hooks/useAuth';

import { deleteMaterialFromServer } from '../services/data';

import {
  useAcademicGroups,
  useAcademicSubjects,
  useDepartments,
  useSections,
  useMaterials,
} from '../hooks/useRealtime';

export default function Teacher() {
  const { profile, user } = useAuth();

  const departments = useDepartments();

  const [departmentId, setDepartmentId] = useState(
    profile?.departmentId || ''
  );

  const [academicGroupId, setAcademicGroupId] = useState(
    profile?.academicGroupId || ''
  );

  const [sectionId, setSectionId] = useState(
    profile?.sectionId || ''
  );

  const [subjectId, setSubjectId] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const academicGroups =
    useAcademicGroups(departmentId);

  const sections =
    useSections(academicGroupId);

  const subjects =
    useAcademicSubjects(academicGroupId);

  const materials = useMaterials(
    undefined,
    subjectId || undefined,
    sectionId
  );

  const selectedDepartment =
    departments.find(
      (x) => x.id === departmentId
    );

  const selectedGroup =
    academicGroups.find(
      (x) => x.id === academicGroupId
    );

  const selectedSection =
    sections.find(
      (x) => x.id === sectionId
    );

  // ============================================================
  // DELETE MATERIAL
  // ============================================================

  async function handleDelete(
    material: typeof materials[number]
  ) {
    if (!user) return;

    const confirmed = window.confirm(
      `Delete "${material.originalName || material.name}"?\n\nThis will permanently remove the file from ClassBoard.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(material.id);

      const token =
        await user.getIdToken();

      await deleteMaterialFromServer(
        material.id,
        token
      );
    } catch (error) {
      console.error(
        'Delete failed:',
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : 'Failed to delete material.'
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <p className="text-sm font-bold text-brand">
        TEACHER
      </p>

      <h1 className="mt-1 text-3xl font-extrabold">
        Good day,{' '}
        {profile?.name?.split(' ')[0] ||
          'Teacher'}{' '}
        👋
      </h1>

      <p className="mt-2 text-slate-500">
        Get material onto the classroom board
        in seconds.
      </p>


      {/* ======================================================
          ACADEMIC SELECTION
      ====================================================== */}

      <section className="mt-7 card p-6">

        <div>
          <h2 className="text-xl font-bold">
            Select Classroom
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose where this material belongs.
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
              onChange={(e) => {
                setDepartmentId(
                  e.target.value
                );

                setAcademicGroupId('');
                setSectionId('');
                setSubjectId('');
              }}
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


          {/* ACADEMIC YEAR */}

          <label>
            <span className="label">
              Academic Year
            </span>

            <select
              className="field"
              value={academicGroupId}
              disabled={!departmentId}
              onChange={(e) => {
                setAcademicGroupId(
                  e.target.value
                );

                setSectionId('');
                setSubjectId('');
              }}
            >
              <option value="">
                Select year
              </option>

              {academicGroups
                .sort(
                  (a, b) =>
                    a.year - b.year
                )
                .map((group) => (
                  <option
                    key={group.id}
                    value={group.id}
                  >
                    {group.yearLabel}
                  </option>
                ))}
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
              onChange={(e) => {
                setSectionId(
                  e.target.value
                );

                setSubjectId('');
              }}
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
                setSubjectId(
                  e.target.value
                )
              }
            >
              <option value="">
                Select subject
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


        {/* SELECTED CLASSROOM */}

        {selectedDepartment &&
          selectedGroup &&
          selectedSection && (
            <div className="mt-5 rounded-xl bg-mint p-4 text-sm font-semibold text-brand">
              {selectedDepartment.code}{' '}
              ·{' '}
              {selectedGroup.yearLabel}{' '}
              · Section{' '}
              {selectedSection.name}
            </div>
          )}

      </section>


      {/* ======================================================
          UPLOAD
      ====================================================== */}

      <div className="mt-7">
        <UploadPanel
          departmentId={departmentId}
          academicGroupId={
            academicGroupId
          }
          sectionId={sectionId}
          subjectId={subjectId}
        />
      </div>


      {/* ======================================================
          RECENT MATERIALS
      ====================================================== */}

      <section className="mt-8">

        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">

          <div>
            <h2 className="text-xl font-bold">
              Recent Materials
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Materials uploaded to the
              selected classroom.
            </p>
          </div>

        </div>


        {!sectionId ? (

          <div className="card p-8 text-center text-slate-500">
            Select a department, year and
            section to see materials.
          </div>

        ) : materials.length ? (

          <div className="space-y-3">

            {materials
              .slice(0, 8)
              .map((m) => (

                <MaterialCard
                  key={m.id}
                  m={m}
                  onDelete={() =>
                    handleDelete(m)
                  }
                />

              ))}

          </div>

        ) : (

          <div className="card p-8 text-center text-slate-500">
            No materials uploaded yet.
          </div>

        )}

      </section>

    </div>
  );
}