<?php

namespace App\Services;

use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Models\DeliveryPersonOrder;
use App\Models\DeliveryPerson;
use Carbon\Carbon;
use Exception;

class DeliveryPersonService
{
    protected $fileHandlerService;

    public function __construct(FileHandlerService $fileHandlerService)
    {
        $this->fileHandlerService = $fileHandlerService;
    }
    public function checkDeliveryPersonDocument()
    {
        $userId = Auth::id();

        if (!$userId) {
            return [
                'success' => false,
                'message' => 'User not authenticated',
            ];
        }

        // Fetch the delivery person once instead of multiple queries
        $deliveryPerson = DeliveryPerson::where('user_id', $userId)->first();

        if (!$deliveryPerson) {
            return [
                'success' => false,
                'message' => 'Delivery person details are not linked to your account. Please enter your delivery person first to use our service.',
            ];
        }

        if ($deliveryPerson->status === null || $deliveryPerson->status === 0) {
            return [
                'success' => false,
                'message' => 'Enter Delivery Person details for the next process',
            ];
        }

        return [
            'success' => true,
            'message' => 'Delivery Person details found successfully',
            'data' => $deliveryPerson,
        ];
    }
    public function saveDeliveryPersonDetails($request)
    {
        $userId = Auth::id();

        if (!$userId) {
            return [
                'success' => false,
                'message' => 'User not authenticated',
            ];
        }

        $data = $request->all();
        $data['user_id'] = $userId;

        // Store files and save paths in data array
        if ($request->hasFile('license_document')) {
            $data['license_document'] = $this->saveFile($request->file('license_document'), 'license_document', $data['name']);
        }

        if ($request->hasFile('PAN_Photo')) {
            $data['PAN_Photo'] = $this->saveFile($request->file('PAN_Photo'), 'PAN_Photo', $data['name']);
        }

        // Create and return the new delivery person record
        return DeliveryPerson::create($data);
    }

    private function saveFile($file, $folder, $name)
    {
        if ($file && $file instanceof \Illuminate\Http\UploadedFile) {
            $dirPath = "/delivery_person_document/{$name}/{$folder}";
            return $this->fileHandlerService->saveFileToStorage($file, $dirPath);
        }
        return null;
    }

    public function toggleOnlineStatus()
    {
        // Get the authenticated user
        $user = Auth::user();

        // Find the Delivery Person associated with the user
        $deliveryPerson = DeliveryPerson::select('id', 'user_id', 'online_status', 'status')
            ->where('user_id', $user->id)->first();

        if ($deliveryPerson) {
            // Toggle the online_status
            $deliveryPerson->online_status = $deliveryPerson->online_status === 1 ? 0 : 1;
            $deliveryPerson->save();

            return $deliveryPerson;
        }

        return null;
    }
    public function getDeliveryPersonOnlineStatus()
    {
        // Get the authenticated user
        $user = Auth::user();

        // Find the deliveryPerson associated with the user
        return DeliveryPerson::where('user_id', $user->id)->first();
    }

    public function getDeliveryDetails(array $filters = [])
    {
        $userId = Auth::id();

        if (!$userId) {
            return [
                'success' => false,
                'message' => 'User not authenticated',
            ];
        }

        $person = DeliveryPerson::where('user_id', $userId)->first();

        if (!$person) {
            return [
                'success' => false,
                'message' => 'Delivery person details are not linked to your account. Please enter your delivery person first to use our service.',
            ];
        }

        $query = DeliveryPersonOrder::where('delivery_person_id', $person->id)
            ->orderBy('created_at', 'desc');

        // Apply time filters
        switch ($filters['time_filter']) {
            case 'today':
                $query->whereDate('created_at', Carbon::today());
                break;
            case 'yesterday':
                $query->whereDate('created_at', Carbon::yesterday());
                break;
            case 'last_7_days':
                $query->where('created_at', '>=', Carbon::now()->subDays(7));
                break;
            case 'last_30_days':
                $query->where('created_at', '>=', Carbon::now()->subDays(30));
                break;
            case 'all':
            default:
                // No additional filter needed
                break;
        }

        return $query->paginate($filters['per_page'], ['*'], 'page', $filters['page']);
    }

    public function getOrderMetrics(): array
    {
        // Total number of orders
        $totalOrders = DeliveryPersonOrder::count();

        // Today’s orders
        $todayOrders = DeliveryPersonOrder::whereDate('created_at', Carbon::today())->count();

        // Today’s income
        $todayIncome = DeliveryPersonOrder::whereDate('created_at', Carbon::today())->sum('delivery_amount');

        // Last 7 days orders
        $last7DaysOrders = DeliveryPersonOrder::whereBetween('created_at', [Carbon::now()->subDays(7), Carbon::now()])->count();

        // Last 7 days income
        $last7DaysIncome = DeliveryPersonOrder::whereBetween('created_at', [Carbon::now()->subDays(7), Carbon::now()])->sum('delivery_amount');

        // Last month orders
        $lastMonthOrders = DeliveryPersonOrder::whereMonth('created_at', Carbon::now()->subMonth()->month)->count();

        // Last month income
        $lastMonthIncome = DeliveryPersonOrder::whereMonth('created_at', Carbon::now()->subMonth()->month)->sum('delivery_amount');

        // Return all metrics as an array
        return [
            'total_orders' => $totalOrders,
            'today_orders' => $todayOrders,
            'today_income' => $todayIncome,
            'last_7_days_orders' => $last7DaysOrders,
            'last_7_days_income' => $last7DaysIncome,
            'last_month_orders' => $lastMonthOrders,
            'last_month_income' => $lastMonthIncome,
        ];
    }
    public function getLocation()
    {

        $user = Auth::user();

        // Find the deliveryPerson associated with the user
        return DeliveryPerson::select('id', 'location', 'latitude', 'longitude')
            ->where('user_id', $user->id)
            ->first();
    }

    public function UpdateLocation($data)
    {
        $user = Auth::user();

        if (!$user) {
            throw new Exception('User not authenticated.');
        }

        $deliveryPerson = DeliveryPerson::where('user_id', $user->id)
            ->where('id', $data['id'])
            ->first();

        if (!$deliveryPerson) {
            throw new Exception('deliveryPerson not found or unauthorized.');
        }

        $deliveryPerson->update([
            'location' => $data['location'],
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
        ]);

        return $deliveryPerson;
    }
    public function getAll()
    {
        return DeliveryPerson::orderBy("id", "asc")->get();
    }

    public function getPaginate($data)
    {
        $pageSize = $data['per_page'] ?? 10;
        $sortBy = $data['sort_by'] ?? 'id';
        $sortOrder = $data['sort_order'] ?? 'asc';

        return DeliveryPerson::orderBy($sortBy, $sortOrder)->paginate($pageSize);
    }

    public function validateCreateDeliveryPersonData($data)
    {
        return Validator::make($data, [
            'name' => 'required|string',
            'number' => 'required|string|unique:delivery_persons,number',
            'driving_license' => 'nullable|string',
            'License_Document_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'PAN_Number' => 'required|string',
            'PAN_Photo_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'delivery_mode' => 'nullable|in:motorcycle,electric_vehicle,bicycle',
            'vehicle_number' => 'required|string',
            'location' => 'required|string',
            'latitude' => 'required|string',
            'longitude' => 'required|string',
            'online_status' => 'required|numeric',
            'status' => 'required|numeric',
        ]);
    }

    public function createDeliveryPerson($request)
    {
        $data = $request->all(); // Convert request to array

        // Handle file uploads
        $data['License_Document_file'] = $request->hasFile('License_Document_file')
            ? $this->saveFile($request->file('license_document'), 'license_document', $data['name'])
            : null;

        $data['PAN_Photo_file'] = $request->hasFile('PAN_Photo_file')
            ? $this->saveFile($request->file('PAN_Photo'), 'PAN_Photo', $data['name'])
            : null;

        // Create the delivery person
        return DeliveryPerson::create([
            'name' => $data['name'],
            'number' => $data['number'],
            'driving_license' => $data['driving_license'] ?? null,
            'license_document' => $data['License_Document_file'] ?? null,
            'PAN_Number' => $data['PAN_Number'],
            'PAN_Photo' => $data['PAN_Photo_file'] ?? null,
            'delivery_mode' => $data['delivery_mode'] ?? null,
            'vehicle_number' => $data['vehicle_number'],
            'location' => $data['location'],
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'online_status' => $data['online_status'],
            'status' => $data['status'],
        ]);
    }

    public function validateDeliveryPersonId($data)
    {
        return Validator::make($data, [
            'id' => 'required|string|exists:delivery_persons,id',
        ]);
    }

    public function getDeliveryPersonById($id)
    {
        return DeliveryPerson::findOrFail($id);
    }

    public function validateUpdateDeliveryPersonData($data)
    {
        return Validator::make($data, [
            'delivery_person_id' => 'required|string|exists:delivery_persons,id',
            'name' => 'required|string',
            'number' => 'required|string|unique:delivery_persons,number,' . $data['delivery_person_id'],
            'driving_license' => 'nullable|string',
            'License_Document_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'PAN_Number' => 'required|string',
            'PAN_Photo_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'delivery_mode' => 'nullable|in:motorcycle,electric_vehicle,bicycle',
            'vehicle_number' => 'required|string',
            'location' => 'required|string',
            'latitude' => 'required|string',
            'longitude' => 'required|string',
            'online_status' => 'required|numeric',
            'status' => 'required|numeric',
        ]);
    }

    public function updateDeliveryPerson($request)
    {
        $data = $request->all(); // Convert request data to an array
        $deliveryPerson = DeliveryPerson::findOrFail($data['delivery_person_id']);

        // Handle file uploads correctly
        if ($request->hasFile('License_Document_file')) {
            $data['License_Document_file'] = $this->saveFile($request->file('License_Document_file'), 'license_document', $data['name']);
        }

        if ($request->hasFile('PAN_Photo_file')) {
            $data['PAN_Photo_file'] = $this->saveFile($request->file('PAN_Photo_file'), 'PAN_Photo', $data['name']);
        }

        // Update only the fields that are provided
        $deliveryPerson->update([
            'name' => $data['name'],
            'number' => $data['number'],
            'driving_license' => $data['driving_license'] ?? $deliveryPerson->driving_license,
            'license_document' => $data['License_Document_file'] ?? $deliveryPerson->license_document,
            'PAN_Number' => $data['PAN_Number'],
            'PAN_Photo' => $data['PAN_Photo_file'] ?? $deliveryPerson->PAN_Photo,
            'delivery_mode' => $data['delivery_mode'] ?? $deliveryPerson->delivery_mode,
            'vehicle_number' => $data['vehicle_number'],
            'location' => $data['location'],
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'online_status' => $data['online_status'],
            'status' => $data['status'],
        ]);

        return $deliveryPerson;
    }


    public function deleteDeliveryPerson($id)
    {
        $deliveryPerson = DeliveryPerson::findOrFail($id);
        $deliveryPerson->delete();

        return $deliveryPerson;
    }
}
