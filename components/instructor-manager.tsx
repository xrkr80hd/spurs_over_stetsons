"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export type InstructorRecord={id:string;public_name:string;bio:string;photo_url:string|null;active:boolean;sort_order:number};
function Editor({person,onSaved}:{person?:InstructorRecord;onSaved:()=>void}){
 const router=useRouter();const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");const [preview,setPreview]=useState<string|null>(null);const [dimensions,setDimensions]=useState({width:0,height:0});const [confirm,setConfirm]=useState(false);
 async function submit(fd:FormData){setBusy(true);setMessage("");try{const res=await fetch("/api/instructors",{method:"POST",body:fd});const json=await res.json();if(!res.ok)throw new Error(json.error||"Unable to save instructor.");setMessage(fd.get("action")==="delete"?"Instructor deleted.":"Instructor saved.");onSaved();router.refresh();}catch(error){setMessage(error instanceof Error?error.message:"Unable to save instructor.");}finally{setBusy(false);}}
 return <div className="p-5"><form onSubmit={e=>{e.preventDefault();void submit(new FormData(e.currentTarget));}} className="grid gap-4 sm:grid-cols-2">
 {person&&<input type="hidden" name="id" value={person.id}/>}
 <div className="field"><label>Instructor name<input name="public_name" required minLength={2} maxLength={120} defaultValue={person?.public_name}/></label></div>
 <div className="field"><label>Display order<input name="sort_order" type="number" min={0} max={9999} defaultValue={person?.sort_order||0}/></label></div>
 <div className="field sm:col-span-2"><label>Biography<textarea name="bio" rows={5} maxLength={10000} defaultValue={person?.bio}/></label></div>
 <div className="field sm:col-span-2"><label>Instructor photo<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required={!person} onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{const bitmap=await createImageBitmap(file);setDimensions({width:bitmap.width,height:bitmap.height});bitmap.close();const reader=new FileReader();reader.onload=()=>setPreview(String(reader.result));reader.readAsDataURL(file);}catch{setMessage("Choose a valid image.");e.target.value="";}}}/></label><p className="text-sm text-[var(--muted)]">JPG, PNG, or WebP · up to 4 MB. Portrait photos work best; the full photo is preserved.</p></div>
 <input type="hidden" name="width" value={dimensions.width}/><input type="hidden" name="height" value={dimensions.height}/>
 {(preview||person?.photo_url)&&<img src={preview||person!.photo_url!} alt="Instructor preview" className="h-48 w-36 rounded-lg object-contain bg-black/20"/>}
 <div className="field"><label>Carousel visibility<select name="active" defaultValue={String(person?.active??true)}><option value="true">Visible on website</option><option value="false">Hidden from website</option></select></label></div>
 <div className="flex gap-3 sm:col-span-2"><button disabled={busy} className="btn btn-primary">{busy?"Saving…":person?"Save changes":"Add instructor"}</button>{person&&<button type="button" disabled={busy} className="btn btn-danger" onClick={()=>setConfirm(true)}>Delete instructor</button>}</div>
 </form>{confirm&&<div className="mt-4 rounded-lg border border-red-500/40 p-4"><p>Delete {person?.public_name} and their uploaded photo? This cannot be undone.</p><div className="mt-3 flex gap-3"><button className="btn btn-danger" disabled={busy} onClick={()=>{const fd=new FormData();fd.set("id",person!.id);fd.set("action","delete");void submit(fd);}}>Confirm delete</button><button className="btn" onClick={()=>setConfirm(false)}>Keep instructor</button></div></div>}{message&&<p role="status" className="mt-4">{message}</p>}</div>
}
export function InstructorManager({instructors}:{instructors:InstructorRecord[]}){
 const [adding,setAdding]=useState(false);const [generation,setGeneration]=useState(0);
 return <div className="space-y-4"><button className="btn btn-primary" onClick={()=>setAdding(!adding)}>{adding?"Close new instructor":"+ Add instructor"}</button>{adding&&<section className="panel"><h2 className="px-5 pt-5 text-xl font-bold">New instructor</h2><Editor key={generation} onSaved={()=>{setAdding(false);setGeneration(g=>g+1);}}/></section>}
 {instructors.map(person=><details key={person.id} className="panel overflow-hidden"><summary className="flex cursor-pointer items-center justify-between gap-3 p-5"><span className="font-bold">▸ {person.public_name}</span><span className="tag">{person.active?"Visible":"Hidden"}</span></summary><Editor person={person} onSaved={()=>{}}/></details>)}{!instructors.length&&<p className="empty">Add your first instructor to the website carousel.</p>}</div>
}
