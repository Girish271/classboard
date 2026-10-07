import { addDoc,collection,deleteDoc,doc,onSnapshot,orderBy,query,serverTimestamp,where } from 'firebase/firestore';
import { db } from '../lib/firebase';import type {ClassRoom,Material,Subject} from '../types';
const needDb=()=>{if(!db)throw new Error('Firebase configuration is missing. Please configure the environment variables described in STEPS.txt.');return db};
export const listenClasses=(cb:(x:ClassRoom[])=>void)=>onSnapshot(collection(needDb(),'classes'),s=>cb(s.docs.map(d=>({id:d.id,...d.data()} as ClassRoom))));
export const listenSubjects=(classId:string,cb:(x:Subject[])=>void)=>onSnapshot(query(collection(needDb(),'subjects'),where('classId','==',classId)),s=>cb(s.docs.map(d=>({id:d.id,...d.data()} as Subject))));
export const listenMaterials=(classId:string,cb:(x:Material[])=>void,subjectId?:string)=>{const filters:any[]=[where('classId','==',classId)];if(subjectId)filters.push(where('subjectId','==',subjectId));filters.push(orderBy('uploadedAt','desc'));return onSnapshot(query(collection(needDb(),'files'),...filters),s=>cb(s.docs.map(d=>({id:d.id,...d.data()} as Material))));};
export const addMaterial=(m:Omit<Material,'id'|'uploadedAt'>)=>addDoc(collection(needDb(),'files'),{...m,uploadedAt:serverTimestamp()});
export const addClass=(x:Omit<ClassRoom,'id'>)=>addDoc(collection(needDb(),'classes'),x);export const addSubject=(x:Omit<Subject,'id'>)=>addDoc(collection(needDb(),'subjects'),x);export const deleteMaterial=(id:string)=>deleteDoc(doc(needDb(),'files',id));
