import{useEffect,useState}from'react';import{listenClasses,listenMaterials,listenSubjects}from'../services/data';import type{ClassRoom,Material,Subject}from'../types';
export const useClasses=()=>{const[x,setX]=useState<ClassRoom[]>([]);useEffect(()=>{try{return listenClasses(setX)}catch{return}},[]);return x};
export const useSubjects=(classId?:string)=>{const[x,setX]=useState<Subject[]>([]);useEffect(()=>{if(!classId)return;try{return listenSubjects(classId,setX)}catch{return}},[classId]);return x};
export const useMaterials=(classId?:string,subjectId?:string)=>{const[x,setX]=useState<Material[]>([]);useEffect(()=>{if(!classId)return;try{return listenMaterials(classId,setX,subjectId)}catch{return}},[classId,subjectId]);return x};
