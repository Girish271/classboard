export type Role='student'|'teacher'|'board'|'admin';
export interface UserProfile{uid:string;name:string;email:string;role:Role;classId?:string}
export interface ClassRoom{id:string;name:string;section?:string}
export interface Subject{id:string;name:string;classId:string}
export interface Material{id:string;name:string;originalName:string;url:string;classId:string;subjectId:string;subjectName:string;uploadedBy:string;uploadedAt:any;fileType:string;fileSize:number}
