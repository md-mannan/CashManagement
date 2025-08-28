import React from 'react';
import { AlertTriangle, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FinancialConstraintWarningProps {
    netBalance: number;
    totalReceivables: number;
    totalPayables: number;
    primaryCurrency: string;
    primarySymbol: string;
}

export default function FinancialConstraintWarning({
    netBalance,
    totalReceivables,
    totalPayables,
    primaryCurrency,
    primarySymbol
}: FinancialConstraintWarningProps) {
    const canCreateReceivable = netBalance >= totalReceivables;
    const canCreatePayable = netBalance >= totalReceivables;
    const canSettlePayable = netBalance >= totalReceivables;
    
    const hasWarnings = !canCreateReceivable || !canCreatePayable || !canSettlePayable;
    const highReceivablesRisk = totalReceivables > netBalance * 0.8;
    const highPayablesRisk = totalPayables > netBalance * 0.5;

    if (!hasWarnings && !highReceivablesRisk && !highPayablesRisk) {
        return (
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm text-green-800">
                        <DollarSign className="h-4 w-4" />
                        Financial Status: Healthy
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-green-700">
                        Your financial position is stable. You can safely create new transactions and settlements.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {/* Critical Warnings */}
            {!canCreateReceivable && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Cannot Create Receivables</AlertTitle>
                    <AlertDescription>
                        Your net balance ({primarySymbol}{netBalance.toFixed(2)}) is insufficient to create new receivable transactions. 
                        You need at least {primarySymbol}{totalReceivables.toFixed(2)} available.
                    </AlertDescription>
                </Alert>
            )}

            {!canCreatePayable && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Cannot Create Payables</AlertTitle>
                    <AlertDescription>
                        Your net balance ({primarySymbol}{netBalance.toFixed(2)}) is insufficient to create new payable transactions. 
                        You need at least {primarySymbol}{totalReceivables.toFixed(2)} available.
                    </AlertDescription>
                </Alert>
            )}

            {!canSettlePayable && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Cannot Settle Payables</AlertTitle>
                    <AlertDescription>
                        Your net balance ({primarySymbol}{netBalance.toFixed(2)}) is insufficient to settle payable transactions. 
                        You need at least {primarySymbol}{totalReceivables.toFixed(2)} available.
                    </AlertDescription>
                </Alert>
            )}

            {/* Risk Warnings */}
            {highReceivablesRisk && (
                <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertTitle>High Receivables Risk</AlertTitle>
                    <AlertDescription>
                        Your receivables ({primarySymbol}{totalReceivables.toFixed(2)}) are high relative to your net balance ({primarySymbol}{netBalance.toFixed(2)}). 
                        Consider collecting outstanding debts before lending more money.
                    </AlertDescription>
                </Alert>
            )}

            {highPayablesRisk && (
                <Alert>
                    <TrendingDown className="h-4 w-4" />
                    <AlertTitle>High Payables Risk</AlertTitle>
                    <AlertDescription>
                        Your payables ({primarySymbol}{totalPayables.toFixed(2)}) are significant relative to your net balance ({primarySymbol}{netBalance.toFixed(2)}). 
                        Consider paying off debts to improve your financial position.
                    </AlertDescription>
                </Alert>
            )}

            {/* Financial Summary Card */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm text-blue-800">
                        <DollarSign className="h-4 w-4" />
                        Financial Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Net Balance:</span>
                        <span className={`font-medium ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {primarySymbol}{netBalance.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Total Receivables:</span>
                        <span className="font-medium text-blue-600">
                            {primarySymbol}{totalReceivables.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Total Payables:</span>
                        <span className="font-medium text-orange-600">
                            {primarySymbol}{totalPayables.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Available for Lending:</span>
                        <span className={`font-medium ${canCreateReceivable ? 'text-green-600' : 'text-red-600'}`}>
                            {primarySymbol}{Math.max(0, netBalance - totalReceivables).toFixed(2)}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm text-amber-800">
                        <AlertTriangle className="h-4 w-4" />
                        Recommendations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-1 text-sm text-amber-700">
                        {!canCreateReceivable && (
                            <li>• Collect outstanding receivables before lending more money</li>
                        )}
                        {!canSettlePayable && (
                            <li>• Increase your net balance before settling payables</li>
                        )}
                        {highReceivablesRisk && (
                            <li>• Consider reducing lending to maintain financial stability</li>
                        )}
                        {highPayablesRisk && (
                            <li>• Focus on paying off debts to improve your position</li>
                        )}
                        <li>• Monitor your net balance regularly</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
