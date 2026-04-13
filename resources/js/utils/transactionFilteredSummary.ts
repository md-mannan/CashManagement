/**
 * Filtered transaction totals aligned with App\Services\TransactionService::getFinancialSummary
 * (primary amounts + optional secondary amounts when metadata matches user's secondary currency).
 */

export type TransactionForSummary = {
    type: string;
    amount: number | string;
    related_transaction_id?: number | null;
    related_transaction?: { type?: string } | null;
    /** Laravel may serialize as camelCase in some contexts */
    relatedTransaction?: { type?: string } | null;
    category?: {
        name?: string;
        type?: string;
        slug?: string;
    } | null;
    metadata?: {
        secondary_currency?: string;
        secondary_amount?: number | string;
    } | null;
};

export type FilteredFinancialSummary = {
    total_income: number;
    total_expenses: number;
    total_receivables: number;
    total_payables: number;
    receivable_settlements: number;
    payable_settlements: number;
    secondary: {
        total_income: number;
        total_expenses: number;
        total_receivables: number;
        total_payables: number;
        receivable_settlements: number;
        payable_settlements: number;
    };
};

function num(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function relatedParentType(t: TransactionForSummary): string | undefined {
    return t.related_transaction?.type ?? t.relatedTransaction?.type;
}

/**
 * When `related_transaction` is not serialized on the list payload, settlement rows
 * still carry a category with type settle_payable / settle_receivable (or name hints).
 */
function settlementBucketFromCategory(t: TransactionForSummary): 'payable' | 'receivable' | null {
    const cat = t.category;
    if (!cat) {
        return null;
    }
    const ctype = (cat.type || '').toLowerCase();
    if (ctype === 'settle_payable') {
        return 'payable';
    }
    if (ctype === 'settle_receivable') {
        return 'receivable';
    }
    const name = (cat.name || '').toLowerCase();
    const slug = (cat.slug || '').toLowerCase();
    const hay = `${name} ${slug}`;
    if (hay.includes('receivable')) {
        return 'receivable';
    }
    if (hay.includes('payable')) {
        return 'payable';
    }
    if (name.includes('return')) {
        return 'receivable';
    }
    if (name.includes('pay')) {
        return 'payable';
    }
    return null;
}

function secondaryAmountForUser(t: TransactionForSummary, userSecondaryCurrency: string): number {
    const m = t.metadata;
    if (!m || m.secondary_currency !== userSecondaryCurrency) {
        return 0;
    }
    return num(m.secondary_amount);
}

export function computeFilteredSummary(
    transactions: TransactionForSummary[],
    userSecondaryCurrency: string,
): FilteredFinancialSummary {
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalReceivables = 0;
    let totalPayables = 0;
    let receivableSettlements = 0;
    let payableSettlements = 0;

    let sIncome = 0;
    let sExpenses = 0;
    let sReceivables = 0;
    let sPayables = 0;
    let sReceivableSettlements = 0;
    let sPayableSettlements = 0;

    for (const t of transactions) {
        const amount = num(t.amount);
        const sec = secondaryAmountForUser(t, userSecondaryCurrency);
        const rtid = t.related_transaction_id;
        const isStandaloneReceivablePayable = rtid == null || rtid === 0;
        const parentType = relatedParentType(t);

        switch (t.type) {
            case 'income':
                totalIncome += amount;
                sIncome += sec;
                break;
            case 'expense':
                totalExpenses += amount;
                sExpenses += sec;
                break;
            case 'receivable':
                if (isStandaloneReceivablePayable) {
                    totalReceivables += amount;
                    sReceivables += sec;
                }
                break;
            case 'payable':
                if (isStandaloneReceivablePayable) {
                    totalPayables += amount;
                    sPayables += sec;
                }
                break;
            case 'settlement': {
                if (parentType === 'receivable') {
                    receivableSettlements += amount;
                    sReceivableSettlements += sec;
                } else if (parentType === 'payable') {
                    payableSettlements += amount;
                    sPayableSettlements += sec;
                } else {
                    const bucket = settlementBucketFromCategory(t);
                    if (bucket === 'receivable') {
                        receivableSettlements += amount;
                        sReceivableSettlements += sec;
                    } else if (bucket === 'payable') {
                        payableSettlements += amount;
                        sPayableSettlements += sec;
                    }
                }
                break;
            }
            case 'settle_receivable':
                receivableSettlements += amount;
                sReceivableSettlements += sec;
                break;
            case 'settle_payable':
                payableSettlements += amount;
                sPayableSettlements += sec;
                break;
            default:
                break;
        }
    }

    return {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        total_receivables: totalReceivables,
        total_payables: totalPayables,
        receivable_settlements: receivableSettlements,
        payable_settlements: payableSettlements,
        secondary: {
            total_income: sIncome,
            total_expenses: sExpenses,
            total_receivables: sReceivables,
            total_payables: sPayables,
            receivable_settlements: sReceivableSettlements,
            payable_settlements: sPayableSettlements,
        },
    };
}

export function hasAnySecondaryTotals(s: FilteredFinancialSummary['secondary']): boolean {
    return Object.values(s).some((v) => Math.abs(num(v)) > 1e-9);
}
