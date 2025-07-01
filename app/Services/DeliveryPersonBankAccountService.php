<?php

namespace App\Services;

use App\Models\DeliveryPersonBankAccount;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Throwable;

class DeliveryPersonBankAccountService
{
    /**
     * Get all bank accounts for a delivery person
     */
    public function getAllBankAccounts(string $deliveryPersonId): Collection
    {
        return DeliveryPersonBankAccount::where('delivery_person_id', $deliveryPersonId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Create a new bank account
     */
    public function createBankAccount(string $deliveryPersonId, array $data): DeliveryPersonBankAccount
    {
        return DB::transaction(function () use ($deliveryPersonId, $data) {
            return DeliveryPersonBankAccount::create([
                'delivery_person_id' => $deliveryPersonId,
                'account_holder_name' => $data['account_holder_name'],
                'account_number' => $data['account_number'],
                'bank_name' => $data['bank_name'],
                'branch_name' => $data['branch_name'],
                'ifsc_code' => $data['ifsc_code'],
                'account_type' => $data['account_type'],
                'upi_id' => $data['upi_id'] ?? null,
            ]);
        });
    }

    /**
     * Get a specific bank account
     */
    public function getBankAccount(string $deliveryPersonId, string $accountId): DeliveryPersonBankAccount
    {
        return DeliveryPersonBankAccount::where('delivery_person_id', $deliveryPersonId)
            ->findOrFail($accountId);
    }

    /**
     * Update a bank account
     */
    public function updateBankAccount(
        string $deliveryPersonId,
        string $accountId,
        array $data
    ): DeliveryPersonBankAccount {
        return DB::transaction(function () use ($deliveryPersonId, $accountId, $data) {
            $bankAccount = $this->getBankAccount($deliveryPersonId, $accountId);

            $bankAccount->update($data);

            return $bankAccount->fresh();
        });
    }

    /**
     * Delete a bank account
     */
    public function deleteBankAccount(string $deliveryPersonId, string $accountId): void
    {
        DB::transaction(function () use ($deliveryPersonId, $accountId) {
            $bankAccount = $this->getBankAccount($deliveryPersonId, $accountId);
            $bankAccount->delete();
        });
    }
}
