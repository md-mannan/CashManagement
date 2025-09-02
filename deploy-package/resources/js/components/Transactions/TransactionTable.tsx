import { Table } from '@/Components';
import Button from '@/Components/Button';
import { useState } from 'react';
import SettlementModal from './SettlementModal';

type Transaction = {
    id: number;
    description: string;
    transaction_type: {
        name: string;
    };
    amount: number;
    settled_amount: number;
    status: 'pending' | 'partial' | 'completed' | 'cancelled';
};

type TransactionTableProps = {
    transactions: Transaction[];
};

export default function TransactionTable({ transactions }: TransactionTableProps) {
    const [showSettlementModal, setShowSettlementModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const getStatusBadge = (transaction: Transaction) => {
        const status = transaction.status;
        const variants = {
            pending: 'bg-yellow-100 text-yellow-800',
            partial: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${variants[status]}`}>
                {status} ({((transaction.settled_amount / transaction.amount) * 100).toFixed(0)}%)
            </span>
        );
    };

    const openSettlementModal = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setShowSettlementModal(true);
    };

    return (
        <>
            <Table>
                <Table.Head>
                    <Table.Header>Description</Table.Header>
                    <Table.Header>Type</Table.Header>
                    <Table.Header>Amount</Table.Header>
                    <Table.Header>Settled</Table.Header>
                    <Table.Header>Status</Table.Header>
                    <Table.Header>Actions</Table.Header>
                </Table.Head>
                <Table.Body>
                    {transactions.map((transaction) => (
                        <Table.Row key={transaction.id}>
                            <Table.Cell>{transaction.description}</Table.Cell>
                            <Table.Cell className="capitalize">{transaction.transaction_type.name}</Table.Cell>
                            <Table.Cell>${transaction.amount.toFixed(2)}</Table.Cell>
                            <Table.Cell>${transaction.settled_amount.toFixed(2)}</Table.Cell>
                            <Table.Cell>{getStatusBadge(transaction)}</Table.Cell>
                            <Table.Cell>
                                {transaction.status !== 'completed' && (
                                    <Button
                                        size="sm"
                                        onClick={() => openSettlementModal(transaction)}
                                    >
                                        Settle
                                    </Button>
                                )}
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>

            {selectedTransaction && (
                <SettlementModal
                    transaction={selectedTransaction}
                    show={showSettlementModal}
                    onClose={() => setShowSettlementModal(false)}
                />
            )}
        </>
    );
}
