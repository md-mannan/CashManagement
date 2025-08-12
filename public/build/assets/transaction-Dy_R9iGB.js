import{u as me,r as i,a as he,j as e,H as xe,b as m}from"./app-B01Ta8PO.js";import{B as r}from"./button-_sbeHVjg.js";import{C as U,a as pe,b as ue,d as W}from"./card-mkjWHMXY.js";import{C as G}from"./custom-date-input-BemItP8i.js";import{A as ge,g as V,h as K,i as Y,j as h}from"./app-layout-Dn_oAfso.js";import{I as fe}from"./input-Detb0Hty.js";import{L as T}from"./label-CgdeuWON.js";import{S as je,a as ye,b as be,c as we,d as ve}from"./select-3euTJA8l.js";import{T as Ne,a as Ce,b as F,c as o,d as Te,e as l}from"./table-CFugcxO8.js";import{P as De,u as L,a as Se}from"./xlsx-Cujvx-Ln.js";import{P as y}from"./plus-Bessh4Sf.js";import{F as ke,S as $e}from"./search-DsGveQVi.js";import{D as Ee}from"./download-Cmfj3lZ8.js";import{F as q}from"./file-text-DboSVYri.js";import{E as Ie}from"./eye-D3rbnyui.js";import{S as J}from"./square-pen-DOWKtAmH.js";import{T as Q}from"./trash-2-D2ZzlSxi.js";import"./vendor-DP3lGzMr.js";import"./calendar-BhMo9djT.js";import"./index-BlgmeOUH.js";import"./Combination-CgqXqUH1.js";import"./index-DNWHCUPZ.js";import"./index-cd3BFBLp.js";import"./app-logo-icon-CQvWsRvf.js";import"./index-DByW4Mmu.js";const Pe=[{title:"Transaction",href:"/transaction"}],Ae=[{value:"all",label:"All Types"},{value:"income",label:"Income"},{value:"expense",label:"Expense"},{value:"receivable",label:"Receivable"},{value:"payable",label:"Payable"}];function nt(){const{auth:z,transactions:M}=me().props,[u,X]=i.useState(""),[g,Z]=i.useState("all"),[f,ee]=i.useState(""),[j,te]=i.useState(""),[c,D]=i.useState(1),O=M.data,[S,k]=i.useState({isOpen:!1,transactionId:null}),[$,E]=i.useState({isOpen:!1,transactionId:null}),b=z.user.primary_currency||"USD",I=z.user.primary_symbol||"$",{showToast:_}=he(),d=i.useMemo(()=>{let t=[...O];if(u.trim()){const s=u.toLowerCase();t=t.filter(a=>a.description.toLowerCase().includes(s)||a.source.toLowerCase().includes(s)||a.category.name.toLowerCase().includes(s)||a.notes?.toLowerCase().includes(s)||a.amount.toString().includes(s)||a.type.toLowerCase().includes(s))}return g!=="all"&&(t=t.filter(s=>s.type===g)),f&&(t=t.filter(s=>s.date>=f)),j&&(t=t.filter(s=>s.date<=j)),t},[O,u,g,f,j]),w=10,v=Math.ceil(d.length/w),x=(c-1)*w,R=d.slice(x,x+w);i.useEffect(()=>{D(1)},[u,g,f,j]);const P=(t,s=b)=>{if(!t||isNaN(t))return s==="KWD"?"0.000":"0.00";const a=Math.round(t*1e3)/1e3,p=(H,C)=>H.toLocaleString("en-US",{minimumFractionDigits:C,maximumFractionDigits:C});return s==="KWD"?p(a,3):p(a,2)},A=t=>new Date(t).toLocaleDateString("en-GB",{year:"numeric",month:"2-digit",day:"2-digit"}),se=t=>{switch(t){case"income":return"text-green-600 bg-green-50";case"expense":return"text-red-600 bg-red-50";case"receivable":return"text-blue-600 bg-blue-50";case"payable":return"text-orange-600 bg-orange-50";default:return"text-gray-600 bg-gray-50"}},ae=t=>{k({isOpen:!0,transactionId:t})},re=t=>{E({isOpen:!0,transactionId:t})},ne=()=>{S.transactionId&&m.delete(`/transaction/${S.transactionId}`,{onSuccess:()=>{_({type:"success",title:"Transaction Deleted!",message:"The transaction has been successfully deleted.",sound:!0})},onError:t=>{_({type:"error",title:"Delete Failed!",message:"There was an error deleting the transaction. Please try again.",sound:!0})}}),k({isOpen:!1,transactionId:null})},ie=()=>{$.transactionId&&m.visit(`/transaction/${$.transactionId}/edit`),E({isOpen:!1,transactionId:null})},N=()=>{k({isOpen:!1,transactionId:null}),E({isOpen:!1,transactionId:null})},le=t=>{m.visit(`/transaction/${t}`)},oe=()=>{const t=d.map((n,de)=>({SL:x+de+1,Date:A(n.date),Description:n.description,Type:n.type.charAt(0).toUpperCase()+n.type.slice(1),Source:n.source,Category:n.category,Amount:`${n.type==="income"||n.type==="receivable"?"+":"-"} ${I} ${P(n.amount,b)}`})),s=L.book_new(),a=L.json_to_sheet(t),p=[{wch:5},{wch:12},{wch:25},{wch:10},{wch:20},{wch:15},{wch:15}];a["!cols"]=p,L.book_append_sheet(s,a,"Transactions");const C=`transactions_${new Date().toISOString().split("T")[0]}.xlsx`;Se(s,C)},B=()=>{const t=`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Transactions Report</title>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        color: #000;
                        line-height: 1.4;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        margin: 0 0 10px 0;
                        color: #333;
                    }
                    .summary {
                        margin-bottom: 20px;
                        font-size: 14px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                        font-size: 12px;
                    }
                    th, td {
                        border: 1px solid #333;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f0f0f0;
                        font-weight: bold;
                        text-align: center;
                    }
                    .amount {
                        text-align: right;
                        font-weight: bold;
                    }
                    .income { color: #008000; }
                    .expense { color: #cc0000; }
                    @media print {
                        body { margin: 10px; }
                        table { page-break-inside: avoid; }
                        .header { break-after: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Transactions Report</h1>
                    <p>Generated on: ${new Date().toLocaleDateString("en-GB",{year:"numeric",month:"2-digit",day:"2-digit"})}</p>
                </div>
                <div class="summary">
                    <p><strong>Total Transactions:</strong> ${d.length}</p>
                    <p><strong>Date Range:</strong> All transactions</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 5%;">SL</th>
                            <th style="width: 12%;">Date</th>
                            <th style="width: 25%;">Description</th>
                            <th style="width: 10%;">Type</th>
                            <th style="width: 15%;">Source</th>
                            <th style="width: 15%;">Category</th>
                            <th style="width: 18%;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${d.map((a,p)=>`
                            <tr>
                                <td style="text-align: center;">${x+p+1}</td>
                                <td>${A(a.date)}</td>
                                <td>${a.description}</td>
                                <td style="text-transform: capitalize;">${a.type}</td>
                                <td>${a.source}</td>
                                <td>${a.category.name}</td>
                                <td class="amount ${a.type==="income"||a.type==="receivable"?"income":"expense"}">${a.type==="income"||a.type==="receivable"?"+":"-"} ${I} ${P(a.amount,b)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
                <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666;">
                    <p>This report was generated automatically from the Cash Management System</p>
                </div>
            </body>
            </html>
        `,s=window.open("","printWindow","width=800,height=600");s&&(s.document.write(t),s.document.close(),s.onload=()=>{s.print(),s.close()},setTimeout(()=>{s.print(),s.close()},1e3))},ce=()=>{B()};return e.jsxs(ge,{breadcrumbs:Pe,children:[e.jsx(xe,{title:"Transaction"}),e.jsxs("div",{className:"flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold tracking-tight",children:"Transactions"}),e.jsx("p",{className:"text-muted-foreground",children:"Manage and view all your transactions"})]}),e.jsxs(V,{children:[e.jsx(K,{asChild:!0,children:e.jsxs(r,{children:[e.jsx(y,{className:"mr-2 h-4 w-4"}),"Add Transaction"]})}),e.jsxs(Y,{align:"end",children:[e.jsxs(h,{className:"flex items-center gap-2 text-green-600",onClick:()=>m.visit("/add-transaction?type=income"),children:[e.jsx(y,{className:"h-4 w-4"}),"Add Income"]}),e.jsxs(h,{className:"flex items-center gap-2 text-red-600",onClick:()=>m.visit("/add-transaction?type=expense"),children:[e.jsx(y,{className:"h-4 w-4"}),"Add Expense"]}),e.jsxs(h,{className:"flex items-center gap-2 text-blue-600",onClick:()=>m.visit("/add-transaction?type=receivable"),children:[e.jsx(y,{className:"h-4 w-4"}),"Add Receivable"]}),e.jsxs(h,{className:"flex items-center gap-2 text-orange-600",onClick:()=>m.visit("/add-transaction?type=payable"),children:[e.jsx(y,{className:"h-4 w-4"}),"Add Payable"]})]})]})]}),e.jsxs(U,{children:[e.jsxs(pe,{children:[e.jsxs(ue,{className:"flex items-center gap-2",children:[e.jsx(ke,{className:"h-4 w-4"}),"Filters"]}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Filters apply instantly as you type. Clear fields to reset."})]}),e.jsx(W,{children:e.jsxs("div",{className:"grid gap-4 md:grid-cols-2 lg:grid-cols-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(T,{htmlFor:"search",children:"Search"}),e.jsxs("div",{className:"relative",children:[e.jsx($e,{className:"absolute top-2.5 left-2 h-4 w-4 text-muted-foreground"}),e.jsx(fe,{id:"search",placeholder:"Search transactions...",value:u,onChange:t=>X(t.target.value),className:"pl-8"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(T,{htmlFor:"type",children:"Type"}),e.jsxs(je,{value:g,onValueChange:Z,children:[e.jsx(ye,{children:e.jsx(be,{placeholder:"Select type"})}),e.jsx(we,{children:Ae.map(t=>e.jsx(ve,{value:t.value,children:t.label},t.value))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(T,{htmlFor:"startDate",children:"Start Date"}),e.jsx(G,{id:"startDate",value:f,onChange:t=>ee(t),placeholder:"dd/mm/yyyy"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(T,{htmlFor:"endDate",children:"End Date"}),e.jsx(G,{id:"endDate",value:j,onChange:t=>te(t),placeholder:"dd/mm/yyyy"})]})]})})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("div",{className:"flex items-center gap-6",children:e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Showing ",x+1," to ",Math.min(x+w,d.length)," of"," ",d.length," transactions"]})}),e.jsxs(V,{children:[e.jsx(K,{asChild:!0,children:e.jsxs(r,{variant:"outline",size:"sm",children:[e.jsx(Ee,{className:"mr-2 h-4 w-4"}),"Export"]})}),e.jsxs(Y,{align:"end",children:[e.jsxs(h,{onClick:oe,children:[e.jsx(q,{className:"mr-2 h-4 w-4"}),"Export to Excel"]}),e.jsxs(h,{onClick:B,children:[e.jsx(q,{className:"mr-2 h-4 w-4"}),"Export to PDF"]}),e.jsxs(h,{onClick:ce,children:[e.jsx(De,{className:"mr-2 h-4 w-4"}),"Print"]})]})]})]}),e.jsx(U,{children:e.jsx(W,{className:"p-0",children:e.jsxs(Ne,{children:[e.jsx(Ce,{children:e.jsxs(F,{children:[e.jsx(o,{className:"w-16",children:"SL"}),e.jsx(o,{children:"Date"}),e.jsx(o,{children:"Description"}),e.jsx(o,{children:"Type"}),e.jsx(o,{children:"Source"}),e.jsx(o,{children:"Category"}),e.jsx(o,{children:"Amount"}),e.jsx(o,{className:"w-32",children:"Actions"})]})}),e.jsx(Te,{children:R.length===0?e.jsx(F,{children:e.jsx(l,{colSpan:8,className:"py-8 text-center text-muted-foreground",children:"No transactions found matching your criteria."})}):R.map((t,s)=>e.jsxs(F,{children:[e.jsx(l,{className:"font-medium",children:(c-1)*M.per_page+s+1}),e.jsx(l,{children:A(t.date)}),e.jsx(l,{className:"font-medium",children:t.description}),e.jsx(l,{children:e.jsx("span",{className:`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${se(t.type)}`,children:t.type.charAt(0).toUpperCase()+t.type.slice(1)})}),e.jsx(l,{children:t.source}),e.jsx(l,{children:t.category.name}),e.jsxs(l,{className:t.type==="income"||t.type==="receivable"?"text-green-600":"text-red-600",children:[t.type==="income"||t.type==="receivable"?"+":"-"," ",t.user?.primary_symbol||I," ",P(t.amount,b)]}),e.jsx(l,{children:e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(r,{variant:"ghost",size:"sm",onClick:()=>le(t.id),className:"h-8 w-8 p-0",children:e.jsx(Ie,{className:"h-4 w-4"})}),e.jsx(r,{variant:"ghost",size:"sm",onClick:()=>re(t.id),className:"h-8 w-8 p-0",children:e.jsx(J,{className:"h-4 w-4"})}),e.jsx(r,{variant:"ghost",size:"sm",onClick:()=>ae(t.id),className:"h-8 w-8 p-0 text-red-600 hover:text-red-700",children:e.jsx(Q,{className:"h-4 w-4"})})]})})]},t.id))})]})})}),v>1&&e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Page ",c," of ",v]}),e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(r,{variant:"outline",size:"sm",onClick:()=>D(Math.max(1,c-1)),disabled:c===1,children:"Previous"}),e.jsx(r,{variant:"outline",size:"sm",onClick:()=>D(Math.min(v,c+1)),disabled:c===v,children:"Next"})]})]})]}),S.isOpen&&e.jsxs("div",{className:"fixed inset-0 z-50 flex items-center justify-center",children:[e.jsx("div",{className:"absolute inset-0 bg-black/50 backdrop-blur-sm duration-200 animate-in fade-in",onClick:N}),e.jsx("div",{className:"relative m-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl duration-200 animate-in zoom-in-95",children:e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100",children:e.jsx(Q,{className:"h-6 w-6 text-red-600"})}),e.jsx("h3",{className:"mb-2 text-lg font-semibold text-gray-900",children:"Delete Transaction"}),e.jsx("p",{className:"mb-6 text-sm text-gray-500",children:"Are you sure you want to delete this transaction? This action cannot be undone."}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx(r,{variant:"outline",onClick:N,className:"flex-1 transition-colors duration-200 hover:bg-gray-50",children:"Cancel"}),e.jsx(r,{onClick:ne,className:"flex-1 bg-red-600 text-white transition-all duration-200 hover:scale-105 hover:bg-red-700",children:"Delete"})]})]})})]}),$.isOpen&&e.jsxs("div",{className:"fixed inset-0 z-50 flex items-center justify-center",children:[e.jsx("div",{className:"absolute inset-0 bg-black/50 backdrop-blur-sm duration-200 animate-in fade-in",onClick:N}),e.jsx("div",{className:"relative m-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl duration-200 animate-in zoom-in-95",children:e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100",children:e.jsx(J,{className:"h-6 w-6 text-blue-600"})}),e.jsx("h3",{className:"mb-2 text-lg font-semibold text-gray-900",children:"Edit Transaction"}),e.jsx("p",{className:"mb-6 text-sm text-gray-500",children:"Do you want to edit this transaction? You'll be redirected to the edit page."}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx(r,{variant:"outline",onClick:N,className:"flex-1 transition-colors duration-200 hover:bg-gray-50",children:"Cancel"}),e.jsx(r,{onClick:ie,className:"flex-1 bg-blue-600 text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700",children:"Edit"})]})]})})]})]})}export{nt as default};
