import{u as ue,r as o,a as pe,j as e,H as ge,b as u}from"./app.js";import{B as l}from"./button.js";import{C as p,a as w,b as N,d as g}from"./card.js";import{C as q}from"./custom-date-input.js";import{A as fe,f as Z,g as J,h as Q,i as f}from"./app-layout.js";import{I as je}from"./input.js";import{L as F}from"./label.js";import{S as ye,a as be,b as we,c as Ne,d as ve}from"./select.js";import{T as Ce,a as Te,b as R,c as x,d as De,e as c}from"./table.js";import{P as Se,u as B,a as ke}from"./xlsx.js";import{P as I}from"./plus.js";import{F as G}from"./file-text.js";import{T as Ie}from"./trending-up.js";import{T as Ee}from"./trending-down.js";import{B as Ae}from"./banknote.js";import{A as Pe}from"./arrow-down-left.js";import{F as $e,S as Fe}from"./search.js";import{D as _e}from"./download.js";import{E as Le}from"./eye.js";import{S as X}from"./square-pen.js";import{T as ee}from"./trash-2.js";import"./vendor.js";import"./calendar.js";import"./index2.js";import"./Combination.js";import"./index.js";import"./index4.js";import"./app-logo-icon.js";import"./user.js";import"./index3.js";const ze=[{title:"Transaction",href:"/transaction"}],Oe=[{value:"all",label:"All Types",color:"text-gray-600"},{value:"income",label:"Income",color:"text-green-600"},{value:"expense",label:"Expense",color:"text-red-600"},{value:"receivable",label:"Receivable",color:"text-blue-600"},{value:"payable",label:"Payable",color:"text-orange-600"}];function pt(){const{auth:_,transactions:U,summary:j}=ue().props,[v,te]=o.useState(""),[C,se]=o.useState("all"),[T,ae]=o.useState(""),[D,re]=o.useState(""),[h,L]=o.useState(1),H=U.data,[S,z]=o.useState({isOpen:!1,transactionId:null}),[k,O]=o.useState({isOpen:!1,transactionId:null}),n=_.user.primary_currency||"USD",d=_.user.primary_symbol||"$",{showToast:W}=pe(),r=o.useMemo(()=>{let t=[...H];if(v.trim()){const s=v.toLowerCase();t=t.filter(a=>a.description.toLowerCase().includes(s)||a.source.toLowerCase().includes(s)||a.category.name.toLowerCase().includes(s)||a.notes?.toLowerCase().includes(s)||a.amount.toString().includes(s)||a.type.toLowerCase().includes(s))}return C!=="all"&&(t=t.filter(s=>s.type===C)),T&&(t=t.filter(s=>s.date>=T)),D&&(t=t.filter(s=>s.date<=D)),t},[H,v,C,T,D]),E=10,A=Math.ceil(r.length/E),y=(h-1)*E,V=r.slice(y,y+E);o.useEffect(()=>{L(1)},[v,C,T,D]);const m=(t,s=n)=>{if(!t||isNaN(t))return s==="KWD"?"0.000":"0.00";const a=Math.round(t*1e3)/1e3,b=(Y,$)=>Y.toLocaleString("en-US",{minimumFractionDigits:$,maximumFractionDigits:$});return s==="KWD"?b(a,3):b(a,2)},M=t=>new Date(t).toLocaleDateString("en-GB",{year:"numeric",month:"2-digit",day:"2-digit"}),le=t=>{switch(t){case"income":return"text-green-600 bg-green-50";case"expense":return"text-red-600 bg-red-50";case"receivable":return"text-blue-600 bg-blue-50";case"payable":return"text-orange-600 bg-orange-50";default:return"text-gray-600 bg-gray-50"}},ne=t=>{z({isOpen:!0,transactionId:t})},ie=t=>{O({isOpen:!0,transactionId:t})},oe=()=>{S.transactionId&&(console.log("Delete transaction clicked:",S.transactionId),console.log("Generated route:",route("transactions.destroy",S.transactionId)),u.delete(route("transactions.destroy",S.transactionId),{onSuccess:()=>{W({type:"success",title:"Transaction Deleted!",message:"The transaction has been successfully deleted.",sound:!0})},onError:t=>{console.error("Delete error:",t),W({type:"error",title:"Delete Failed!",message:"There was an error deleting the transaction. Please try again.",sound:!0})}})),z({isOpen:!1,transactionId:null})},ce=()=>{k.transactionId&&(console.log("Edit transaction clicked:",k.transactionId),console.log("Generated route:",route("transactions.edit",k.transactionId)),u.visit(route("transactions.edit",k.transactionId))),O({isOpen:!1,transactionId:null})},P=()=>{z({isOpen:!1,transactionId:null}),O({isOpen:!1,transactionId:null})},de=t=>{console.log("View transaction clicked:",t);try{const s=route("transactions.show",t);console.log("Generated route:",s),console.log("Auth user:",_.user),console.log("About to navigate to:",s),u.visit(s,{preserveState:!1,preserveScroll:!1})}catch(s){console.error("Route generation error:",s),console.error("Transaction ID:",t),console.error("Available routes:",Object.keys(window.Ziggy?.routes||{}))}},me=()=>{const t=r.map((i,he)=>({SL:y+he+1,Date:M(i.date),Description:i.description,Type:i.type.charAt(0).toUpperCase()+i.type.slice(1),Source:i.source,Category:i.category,Amount:`${i.type==="income"||i.type==="receivable"?"+":"-"} ${d} ${m(i.amount,n)}`})),s=B.book_new(),a=B.json_to_sheet(t),b=[{wch:5},{wch:12},{wch:25},{wch:10},{wch:20},{wch:15},{wch:15}];a["!cols"]=b,B.book_append_sheet(s,a,"Transactions");const $=`transactions_${new Date().toISOString().split("T")[0]}.xlsx`;ke(s,$)},K=()=>{const t=`
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
                    <p><strong>Total Transactions:</strong> ${r.length}</p>
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
                        ${r.map((a,b)=>`
                            <tr>
                                <td style="text-align: center;">${y+b+1}</td>
                                <td>${M(a.date)}</td>
                                <td>${a.description}</td>
                                <td style="text-transform: capitalize;">${a.type}</td>
                                <td>${a.source}</td>
                                <td>${a.category.name}</td>
                                <td class="amount ${a.type==="income"||a.type==="receivable"?"income":"expense"}">${a.type==="income"||a.type==="receivable"?"+":"-"} ${d} ${m(a.amount,n)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
                <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666;">
                    <p>This report was generated automatically from the Cash Management System</p>
                </div>
            </body>
            </html>
        `,s=window.open("","printWindow","width=800,height=600");s&&(s.document.write(t),s.document.close(),s.onload=()=>{s.print(),s.close()},setTimeout(()=>{s.print(),s.close()},1e3))},xe=()=>{K()};return e.jsxs(fe,{breadcrumbs:ze,children:[e.jsx(ge,{title:"Transaction"}),e.jsxs("div",{className:"flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold tracking-tight",children:"Transactions"}),e.jsx("p",{className:"text-muted-foreground",children:"Manage and view all your transactions"})]}),e.jsxs(Z,{children:[e.jsx(J,{asChild:!0,children:e.jsxs(l,{children:[e.jsx(I,{className:"mr-2 h-4 w-4"}),"Add Transaction"]})}),e.jsxs(Q,{align:"end",children:[e.jsxs(f,{className:"flex items-center gap-2 text-green-600",onClick:()=>u.visit(route("transactions.add-income")),children:[e.jsx(I,{className:"h-4 w-4"}),"Add Income"]}),e.jsxs(f,{className:"flex items-center gap-2 text-red-600",onClick:()=>u.visit(route("transactions.add-expense")),children:[e.jsx(I,{className:"h-4 w-4"}),"Add Expense"]}),e.jsxs(f,{className:"flex items-center gap-2 text-blue-600",onClick:()=>u.visit(route("transactions.add-receivable")),children:[e.jsx(I,{className:"h-4 w-4"}),"Add Receivable"]}),e.jsxs(f,{className:"flex items-center gap-2 text-orange-600",onClick:()=>u.visit(route("transactions.add-payable")),children:[e.jsx(I,{className:"h-4 w-4"}),"Add Payable"]})]})]})]}),e.jsxs("div",{className:"grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",children:[e.jsxs(p,{children:[e.jsxs(w,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(N,{className:"text-sm font-medium",children:"Net Balance"}),e.jsx(G,{className:"h-4 w-4 text-gray-600"})]}),e.jsxs(g,{children:[e.jsxs("div",{className:`text-2xl font-bold ${j.net_balance>=0?"text-green-600":"text-red-600"}`,children:[d,m(j.net_balance,n)]}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"(Income - Expenses) + (Receivables - Payables)"})]})]}),e.jsxs(p,{children:[e.jsxs(w,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(N,{className:"text-sm font-medium",children:"Total Income"}),e.jsx(Ie,{className:"h-4 w-4 text-green-600"})]}),e.jsxs(g,{children:[e.jsxs("div",{className:"text-2xl font-bold text-green-600",children:[d,m(j.total_income,n)]}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:[r.filter(t=>t.type==="income").length," transactions"]})]})]}),e.jsxs(p,{children:[e.jsxs(w,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(N,{className:"text-sm font-medium",children:"Total Expenses"}),e.jsx(Ee,{className:"h-4 w-4 text-red-600"})]}),e.jsxs(g,{children:[e.jsxs("div",{className:"text-2xl font-bold text-red-600",children:[d,m(j.total_expenses,n)]}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:[r.filter(t=>t.type==="expense").length," transactions"]})]})]}),e.jsxs(p,{children:[e.jsxs(w,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(N,{className:"text-sm font-medium",children:"Receivables"}),e.jsx(Ae,{className:"h-4 w-4 text-blue-600"})]}),e.jsxs(g,{children:[e.jsxs("div",{className:"text-2xl font-bold text-blue-600",children:[d,m(j.total_receivables,n)]}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:[r.filter(t=>t.type==="receivable").length," transactions"]})]})]}),e.jsxs(p,{children:[e.jsxs(w,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(N,{className:"text-sm font-medium",children:"Payables"}),e.jsx(Pe,{className:"h-4 w-4 text-orange-600"})]}),e.jsxs(g,{children:[e.jsxs("div",{className:"text-2xl font-bold text-orange-600",children:[d,m(j.total_payables,n)]}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:[r.filter(t=>t.type==="payable").length," transactions"]})]})]})]}),e.jsxs(p,{children:[e.jsxs(w,{children:[e.jsxs(N,{className:"flex items-center gap-2",children:[e.jsx($e,{className:"h-4 w-4"}),"Filters"]}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Filters apply instantly as you type. Clear fields to reset."})]}),e.jsx(g,{children:e.jsxs("div",{className:"grid gap-4 md:grid-cols-2 lg:grid-cols-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(F,{htmlFor:"search",children:"Search"}),e.jsxs("div",{className:"relative",children:[e.jsx(Fe,{className:"absolute top-2.5 left-2 h-4 w-4 text-muted-foreground"}),e.jsx(je,{id:"search",placeholder:"Search transactions...",value:v,onChange:t=>te(t.target.value),className:"pl-8"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(F,{htmlFor:"type",children:"Type"}),e.jsxs(ye,{value:C,onValueChange:se,children:[e.jsx(be,{children:e.jsx(we,{placeholder:"Select type"})}),e.jsx(Ne,{children:Oe.map(t=>e.jsx(ve,{value:t.value,children:t.label},t.value))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(F,{htmlFor:"startDate",children:"Start Date"}),e.jsx(q,{id:"startDate",value:T,onChange:t=>ae(t),placeholder:"dd/mm/yyyy"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(F,{htmlFor:"endDate",children:"End Date"}),e.jsx(q,{id:"endDate",value:D,onChange:t=>re(t),placeholder:"dd/mm/yyyy"})]})]})})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("div",{className:"flex items-center gap-6",children:e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Showing ",y+1," to ",Math.min(y+E,r.length)," of"," ",r.length," transactions"]})}),e.jsxs(Z,{children:[e.jsx(J,{asChild:!0,children:e.jsxs(l,{variant:"outline",size:"sm",children:[e.jsx(_e,{className:"mr-2 h-4 w-4"}),"Export"]})}),e.jsxs(Q,{align:"end",children:[e.jsxs(f,{onClick:me,children:[e.jsx(G,{className:"mr-2 h-4 w-4"}),"Export to Excel"]}),e.jsxs(f,{onClick:K,children:[e.jsx(G,{className:"mr-2 h-4 w-4"}),"Export to PDF"]}),e.jsxs(f,{onClick:xe,children:[e.jsx(Se,{className:"mr-2 h-4 w-4"}),"Print"]})]})]})]}),e.jsx(p,{children:e.jsx(g,{className:"p-0",children:e.jsxs(Ce,{children:[e.jsx(Te,{children:e.jsxs(R,{children:[e.jsx(x,{className:"w-16",children:"SL"}),e.jsx(x,{children:"Date"}),e.jsx(x,{children:"Description"}),e.jsx(x,{children:"Type"}),e.jsx(x,{children:"Source"}),e.jsx(x,{children:"Category"}),e.jsx(x,{children:"Amount"}),e.jsx(x,{className:"w-32",children:"Actions"})]})}),e.jsx(De,{children:V.length===0?e.jsx(R,{children:e.jsx(c,{colSpan:8,className:"py-8 text-center text-muted-foreground",children:"No transactions found matching your criteria."})}):V.map((t,s)=>e.jsxs(R,{children:[e.jsx(c,{className:"font-medium",children:(h-1)*U.per_page+s+1}),e.jsx(c,{children:M(t.date)}),e.jsx(c,{className:"font-medium",children:t.description}),e.jsx(c,{children:e.jsx("span",{className:`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${le(t.type)}`,children:t.type.charAt(0).toUpperCase()+t.type.slice(1)})}),e.jsx(c,{children:t.source}),e.jsx(c,{children:t.category.name}),e.jsxs(c,{className:`${t.type==="income"||t.type==="receivable"?"text-green-600":"text-red-600"}`,children:[t.type==="income"||t.type==="receivable"?"+":"-"," ",t.user?.primary_symbol||d," ",m(t.amount,n)]}),e.jsx(c,{children:e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(l,{variant:"ghost",size:"sm",onClick:()=>de(t.id),className:"h-8 w-8 p-0",children:e.jsx(Le,{className:"h-4 w-4"})}),e.jsx(l,{variant:"ghost",size:"sm",onClick:()=>ie(t.id),className:"h-8 w-8 p-0",children:e.jsx(X,{className:"h-4 w-4"})}),e.jsx(l,{variant:"ghost",size:"sm",onClick:()=>ne(t.id),className:"h-8 w-8 p-0 text-red-600 hover:text-red-700",children:e.jsx(ee,{className:"h-4 w-4"})})]})})]},t.id))})]})})}),A>1&&e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Page ",h," of ",A]}),e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(l,{variant:"outline",size:"sm",onClick:()=>L(Math.max(1,h-1)),disabled:h===1,children:"Previous"}),e.jsx(l,{variant:"outline",size:"sm",onClick:()=>L(Math.min(A,h+1)),disabled:h===A,children:"Next"})]})]})]}),S.isOpen&&e.jsxs("div",{className:"fixed inset-0 z-50 flex items-center justify-center",children:[e.jsx("div",{className:"absolute inset-0 bg-black/50 backdrop-blur-sm duration-200 animate-in fade-in",onClick:P}),e.jsx("div",{className:"relative m-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl duration-200 animate-in zoom-in-95",children:e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100",children:e.jsx(ee,{className:"h-6 w-6 text-red-600"})}),e.jsx("h3",{className:"mb-2 text-lg font-semibold text-gray-900",children:"Delete Transaction"}),e.jsx("p",{className:"mb-6 text-sm text-gray-500",children:"Are you sure you want to delete this transaction? This action cannot be undone."}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx(l,{variant:"outline",onClick:P,className:"flex-1 transition-colors duration-200 hover:bg-gray-50",children:"Cancel"}),e.jsx(l,{onClick:oe,className:"flex-1 bg-red-600 text-white transition-all duration-200 hover:scale-105 hover:bg-red-700",children:"Delete"})]})]})})]}),k.isOpen&&e.jsxs("div",{className:"fixed inset-0 z-50 flex items-center justify-center",children:[e.jsx("div",{className:"absolute inset-0 bg-black/50 backdrop-blur-sm duration-200 animate-in fade-in",onClick:P}),e.jsx("div",{className:"relative m-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl duration-200 animate-in zoom-in-95",children:e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100",children:e.jsx(X,{className:"h-6 w-6 text-blue-600"})}),e.jsx("h3",{className:"mb-2 text-lg font-semibold text-gray-900",children:"Edit Transaction"}),e.jsx("p",{className:"mb-6 text-sm text-gray-500",children:"Do you want to edit this transaction? You'll be redirected to the edit page."}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx(l,{variant:"outline",onClick:P,className:"flex-1 transition-colors duration-200 hover:bg-gray-50",children:"Cancel"}),e.jsx(l,{onClick:ce,className:"flex-1 bg-blue-600 text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700",children:"Edit"})]})]})})]})]})}export{pt as default};
