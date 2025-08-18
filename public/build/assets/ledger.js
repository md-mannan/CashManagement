import{c as F,u as H,r as L,j as e,H as V,b as w}from"./app.js";import{B as k}from"./button.js";import{C as x,a as p,b as h,d as u,c as W}from"./card.js";import{C as E}from"./custom-date-input.js";import{A as q,h as K,i as Y,j as Z,k as v,F as J}from"./app-layout.js";import{P as Q,u as _,w as X}from"./xlsx.js";import{P as ee}from"./plus.js";import{T as B}from"./trending-up.js";import{T as A}from"./trending-down.js";import{B as R}from"./banknote.js";import{C as M}from"./credit-card.js";import{D as te}from"./download.js";import"./vendor.js";import"./input.js";import"./calendar.js";import"./index2.js";import"./Combination.js";import"./index.js";import"./index4.js";import"./app-logo-icon.js";import"./lock.js";import"./user.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const se=[["circle",{cx:"8",cy:"8",r:"6",key:"3yglwk"}],["path",{d:"M18.09 10.37A6 6 0 1 1 10.34 18",key:"t5s6rm"}],["path",{d:"M7 6h1v4",key:"1obek4"}],["path",{d:"m16.71 13.88.7.71-2.82 2.82",key:"1rbuyh"}]],ae=F("Coins",se);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const re=[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M8 13h2",key:"yr2amv"}],["path",{d:"M14 13h2",key:"un5t4a"}],["path",{d:"M8 17h2",key:"2yhykz"}],["path",{d:"M14 17h2",key:"10kma7"}]],P=F("FileSpreadsheet",re),ne=[{title:"Ledger",href:"/ledger"}];function $e(){const{auth:b,transactions:S,summary:g,filters:T}=H().props,c=b.user.primary_currency||"BDT",m=b.user.primary_symbol||"৳",f=b.user.secondary_currency||"KWD",j=b.user.secondary_symbol||"د.ك";parseFloat(b.user.exchange_rate||"1.0");const[D,G]=L.useState(T?.start_date||""),[C,I]=L.useState(T?.end_date||""),y=(()=>{const t=[...S].sort((s,l)=>new Date(s.date).getTime()-new Date(l.date).getTime());let r=0;const a=[];return t.length>0&&a.push({id:0,date:t[0].date,description:"Opening Balance",source:"Initial",debit:null,credit:null,balance:r,isOpeningBalance:!0,metadata:null}),t.forEach(s=>{let l=null,d=null;const o=typeof s.amount=="string"?parseFloat(s.amount)||0:s.amount||0;s.type==="expense"?(l=o,r-=o):s.type==="income"?(d=o,r+=o):s.type==="payable"?(l=o,r-=o):s.type==="receivable"&&(d=o,r+=o),a.push({id:s.id,date:s.date,description:s.description,source:s.source,category:s.category.name,user:s.user,debit:l,credit:d,balance:r,type:s.type,metadata:s.metadata})}),a})(),N=(()=>{let t=0,r=0,a=0,s=0;return S.forEach(l=>{const d=l.metadata?.secondary_currency&&l.metadata?.secondary_amount?l.metadata.secondary_amount:typeof l.amount=="string"?parseFloat(l.amount):l.amount;switch(l.type){case"income":t+=d;break;case"expense":r+=d;break;case"receivable":a+=d;break;case"payable":s+=d;break}}),{total_income:t,total_expenses:r,total_receivables:a,total_payables:s,net_balance:t-r+(a-s)}})(),n=(t,r=c)=>{const a=Math.round(t*1e3)/1e3,s=(l,d)=>l.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});return r==="KWD"?s(a,3):s(a,2)},O=()=>{const t=["Date","Description","Source","Debit","Credit","Balance"],r=y.map(i=>[new Date(i.date).toLocaleDateString("en-GB",{year:"numeric",month:"2-digit",day:"2-digit"}),i.description,i.source,i.debit?`${m} ${n(i.debit,c)}`:"",i.credit?`${m} ${n(i.credit,c)}`:"",`${m} ${n(i.balance,c)}`]),a=D&&C?`Date Range: ${D} to ${C}`:"Complete Transaction History",l=[...[["TRANSACTION LEDGER REPORT"],[""],[a],[`Generated on: ${new Date().toLocaleDateString("en-GB",{year:"numeric",month:"2-digit",day:"2-digit"})}`],["Currency: "+c],[""],t].map(i=>i.join(",")),...r.map(i=>i.join(","))].join(`
`),d=new Blob([l],{type:"text/csv;charset=utf-8;"}),o=document.createElement("a");o.href=URL.createObjectURL(d),o.download=`ledger_${new Date().toISOString().split("T")[0]}.csv`,o.click()},z=()=>{const t=_.book_new(),r=["Date","Description","Source","Debit","Credit","Balance"],a=y.map(i=>[new Date(i.date).toLocaleDateString("en-GB",{year:"numeric",month:"2-digit",day:"2-digit"}),i.description,i.source,i.debit||null,i.credit||null,i.balance]),s=_.aoa_to_sheet([r,...a]);_.book_append_sheet(t,s,"Transaction Ledger");const l=X(t,{bookType:"xlsx",type:"array"}),d=new Blob([l],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),o=document.createElement("a");o.href=URL.createObjectURL(d),o.download=`ledger_${new Date().toISOString().split("T")[0]}.xlsx`,o.click()},$=()=>{const t=window.open("","_blank");if(!t)return;const r=`
            <!DOCTYPE html>
            <html>
            <head>
                <title>General Ledger - ${new Date().toLocaleDateString()}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                        font-size: 12px;
                    }
                    h1 { 
                        text-align: center; 
                        color: #333; 
                        margin-bottom: 20px;
                        font-size: 24px;
                    }
                    .header-info {
                        text-align: center;
                        margin-bottom: 30px;
                        color: #666;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 20px;
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 8px; 
                        text-align: left;
                    }
                    th { 
                        background-color: #f5f5f5; 
                        font-weight: bold;
                        text-align: center;
                    }
                    .text-right { text-align: right; }
                    .text-red { color: #dc2626; }
                    .text-green { color: #16a34a; }
                    .font-bold { font-weight: bold; }
                    @media print {
                        body { margin: 0; }
                        @page { margin: 1cm; }
                    }
                </style>
            </head>
            <body>
                <h1>General Ledger</h1>
                <div class="header-info">
                    <p>Generated on: ${new Date().toLocaleDateString("en-GB")} at ${new Date().toLocaleTimeString()}</p>
                    <p>Total Transactions: ${y.length}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Source</th>
                            <th>Debit</th>
                            <th>Credit</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${y.map(a=>`
                            <tr>
                                <td>${new Date(a.date).toLocaleDateString("en-GB")}</td>
                                <td>${a.description}</td>
                                <td>${a.source}</td>
                                <td class="text-right">
                                    ${a.debit?`<span class="text-red">${m} ${n(a.debit,c)}</span>`:"-"}
                                </td>
                                <td class="text-right">
                                    ${a.credit?`<span class="text-green">${m} ${n(a.credit,c)}</span>`:"-"}
                                </td>
                                <td class="text-right font-bold">${m} ${n(a.balance,c)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </body>
            </html>
        `;t.document.write(r),t.document.close(),t.onload=()=>{t.print(),t.close()}},U=()=>{$()};return e.jsxs(q,{breadcrumbs:ne,children:[e.jsx(V,{title:"Ledger"}),e.jsx("div",{className:"flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-2 sm:p-4 w-full max-w-full",children:e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"financial-summary space-y-4",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-xl font-semibold tracking-tight",children:"Financial Summary"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Overview of your current financial position"})]}),e.jsxs(K,{children:[e.jsx(Y,{asChild:!0,children:e.jsxs(k,{className:"flex items-center gap-2",children:[e.jsx(ee,{className:"h-4 w-4"}),"Add Transaction"]})}),e.jsxs(Z,{align:"end",className:"w-48",children:[e.jsxs(v,{className:"flex items-center gap-2 text-green-600",onClick:()=>w.visit(route("transactions.add-income")),children:[e.jsx(B,{className:"h-4 w-4"}),"Add Income"]}),e.jsxs(v,{className:"flex items-center gap-2 text-red-600",onClick:()=>w.visit(route("transactions.add-expense")),children:[e.jsx(A,{className:"h-4 w-4"}),"Add Expense"]}),e.jsxs(v,{className:"flex items-center gap-2 text-blue-600",onClick:()=>w.visit(route("transactions.add-receivable")),children:[e.jsx(R,{className:"h-4 w-4"}),"Add Receivable"]}),e.jsxs(v,{className:"flex items-center gap-2 text-orange-600",onClick:()=>w.visit(route("transactions.add-payable")),children:[e.jsx(M,{className:"h-4 w-4"}),"Add Payable"]})]})]})]}),e.jsxs("div",{className:"grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",children:[e.jsxs(x,{className:"border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100",children:[e.jsxs(p,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(h,{className:"text-sm font-medium text-purple-800",children:"Net Balance"}),e.jsx("div",{className:"flex h-8 w-8 items-center justify-center rounded-full bg-purple-200",children:e.jsx(ae,{className:"h-4 w-4 text-purple-700"})})]}),e.jsxs(u,{children:[e.jsxs("div",{className:"text-2xl font-bold text-purple-800",children:[m," ",n(g.net_balance,c)]}),e.jsx("div",{className:"space-y-1 text-sm text-purple-600",children:e.jsxs("div",{children:[j," ",n(N.net_balance,f)]})}),e.jsx("p",{className:"mt-1 text-xs text-purple-600",children:"Current balance"})]})]}),e.jsxs(x,{className:"border-green-200 bg-gradient-to-br from-green-50 to-green-100",children:[e.jsxs(p,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(h,{className:"text-sm font-medium text-green-800",children:"Income"}),e.jsx("div",{className:"flex h-8 w-8 items-center justify-center rounded-full bg-green-200",children:e.jsx(B,{className:"h-4 w-4 text-green-700"})})]}),e.jsxs(u,{children:[e.jsxs("div",{className:"text-2xl font-bold text-green-800",children:[m," ",n(g.total_income,c)]}),e.jsx("div",{className:"space-y-1 text-sm text-green-600",children:e.jsxs("div",{children:[j," ",n(N.total_income,f)]})}),e.jsx("p",{className:"mt-1 text-xs text-green-600",children:"Total income"})]})]}),e.jsxs(x,{className:"border-red-200 bg-gradient-to-br from-red-50 to-red-100",children:[e.jsxs(p,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(h,{className:"text-sm font-medium text-red-800",children:"Expenses"}),e.jsx("div",{className:"flex h-8 w-8 items-center justify-center rounded-full bg-red-200",children:e.jsx(A,{className:"h-4 w-4 text-red-700"})})]}),e.jsxs(u,{children:[e.jsxs("div",{className:"text-2xl font-bold text-red-800",children:[m," ",n(g.total_expenses,c)]}),e.jsx("div",{className:"space-y-1 text-sm text-red-600",children:e.jsxs("div",{children:[j," ",n(N.total_expenses,f)]})}),e.jsx("p",{className:"mt-1 text-xs text-red-600",children:"Total expenses"})]})]}),e.jsxs(x,{className:"border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100",children:[e.jsxs(p,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(h,{className:"text-sm font-medium text-orange-800",children:"Payable"}),e.jsx("div",{className:"flex h-8 w-8 items-center justify-center rounded-full bg-orange-200",children:e.jsx(M,{className:"h-4 w-4 text-orange-700"})})]}),e.jsxs(u,{children:[e.jsxs("div",{className:"text-2xl font-bold text-orange-800",children:[m," ",n(g.total_payables,c)]}),e.jsx("div",{className:"space-y-1 text-sm text-orange-600",children:e.jsxs("div",{children:[j," ",n(N.total_payables,f)]})}),e.jsx("p",{className:"mt-1 text-xs text-orange-600",children:"Total payables"})]})]}),e.jsxs(x,{className:"border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100",children:[e.jsxs(p,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(h,{className:"text-sm font-medium text-blue-800",children:"Receivable"}),e.jsx("div",{className:"flex h-8 w-8 items-center justify-center rounded-full bg-blue-200",children:e.jsx(R,{className:"h-4 w-4 text-blue-700"})})]}),e.jsxs(u,{children:[e.jsxs("div",{className:"text-2xl font-bold text-blue-800",children:[m," ",n(g.total_receivables,c)]}),e.jsx("div",{className:"space-y-1 text-sm text-blue-600",children:e.jsxs("div",{children:[j," ",n(N.total_receivables,f)]})}),e.jsx("p",{className:"mt-1 text-xs text-blue-600",children:"Total receivables"})]})]})]})]}),e.jsxs("div",{className:"ledger-section space-y-4",children:[e.jsxs("div",{className:"print:hidden",children:[e.jsx("h2",{className:"text-xl font-semibold tracking-tight",children:"Transaction Ledger"}),e.jsx("p",{className:"text-sm text-muted-foreground print:hidden",children:"Complete transaction history with running balance"})]}),e.jsxs(x,{className:"print:border-0 print:shadow-none print-content",children:[e.jsx(p,{className:"print:pb-2",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx(h,{className:"print:text-2xl",children:"General Ledger"}),e.jsx(W,{className:"print:hidden",children:"All transactions with running balance"})]}),e.jsxs("div",{className:"no-print flex items-center space-x-2",children:[e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(E,{value:D,onChange:t=>G(t),className:"rounded-md border px-3 py-2 text-sm",placeholder:"dd/mm/yyyy"}),e.jsx("span",{className:"text-sm text-muted-foreground",children:"to"}),e.jsx(E,{value:C,onChange:t=>I(t),className:"rounded-md border px-3 py-2 text-sm",placeholder:"dd/mm/yyyy"})]}),e.jsxs("div",{className:"group relative",children:[e.jsxs(k,{variant:"outline",size:"sm",children:[e.jsx(te,{className:"mr-2 h-4 w-4"}),"Export"]}),e.jsx("div",{className:"invisible absolute top-full right-0 z-50 mt-1 w-48 rounded-md border bg-white opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100",children:e.jsxs("div",{className:"py-1",children:[e.jsxs("button",{onClick:O,className:"flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100",children:[e.jsx(P,{className:"mr-2 h-4 w-4"}),"Export as CSV"]}),e.jsxs("button",{onClick:z,className:"flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100",children:[e.jsx(P,{className:"mr-2 h-4 w-4"}),"Export as Excel"]}),e.jsxs("button",{onClick:$,className:"flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100",children:[e.jsx(J,{className:"mr-2 h-4 w-4"}),"Export as PDF"]})]})})]}),e.jsxs(k,{variant:"outline",size:"sm",onClick:U,children:[e.jsx(Q,{className:"mr-2 h-4 w-4"}),"Print"]})]})]})}),e.jsx(u,{className:"print:p-0",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full print:w-full",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b print:border-b-2",children:[e.jsx("th",{className:"px-4 py-3 text-left text-sm font-semibold print:text-base",children:"Date"}),e.jsx("th",{className:"px-4 py-3 text-left text-sm font-semibold print:text-base",children:"Description"}),e.jsx("th",{className:"px-4 py-3 text-left text-sm font-semibold print:text-base",children:"Source"}),e.jsx("th",{className:"px-4 py-3 text-right text-sm font-semibold print:text-base",children:"Debit"}),e.jsx("th",{className:"px-4 py-3 text-right text-sm font-semibold print:text-base",children:"Credit"}),e.jsx("th",{className:"px-4 py-3 text-right text-sm font-semibold print:text-base",children:"Balance"})]})}),e.jsx("tbody",{className:"divide-y print:divide-y-2",children:y.map((t,r)=>e.jsxs("tr",{className:"hover:bg-gray-50 print:hover:bg-transparent",children:[e.jsx("td",{className:"px-4 py-3 text-sm print:text-base",children:new Date(t.date).toLocaleDateString("en-GB",{year:"numeric",month:"2-digit",day:"2-digit"})}),e.jsx("td",{className:"px-4 py-3 text-sm print:text-base",children:t.description}),e.jsx("td",{className:"px-4 py-3 text-sm print:text-base",children:t.source}),e.jsx("td",{className:"px-4 py-3 text-right text-sm print:text-base",children:t.debit?e.jsxs("span",{className:"text-red-600",children:[m," ",n(t.debit,c)]}):"-"}),e.jsx("td",{className:"px-4 py-3 text-right text-sm print:text-base",children:t.credit?e.jsxs("span",{className:"text-green-600",children:[m," ",n(t.credit,c)]}):"-"}),e.jsxs("td",{className:"px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold",children:[m," ",n(t.balance,c)]})]},t.id||r))})]})})})]})]})]})})]})}export{$e as default};
