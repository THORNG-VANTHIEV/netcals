export function safeCell(value:unknown):string {const string=String(value??'');const safe=/^[\s]*[=+\-@\t\r]/.test(string)?`'${string}`:string;return `"${safe.replaceAll('"','""')}"`}
export function csv(headers:string[],rows:unknown[][]):string {return [headers,...rows].map(row=>row.map(safeCell).join(',')).join('\r\n')}
export function download(name:string,content:string,type:string):void {const url=URL.createObjectURL(new Blob([content],{type}));const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export async function copyText(value:string):Promise<void>{await navigator.clipboard.writeText(value)}
