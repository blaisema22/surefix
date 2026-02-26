# Component Update Template

Use this template to update other components to use the API integration.

## Template: Fetching Data

```jsx
import { useState, useEffect } from 'react';
import { useShops } from '../../hooks/useShops'; // Import appropriate hook
import PageWrap from '../../components/layout/PageWrap';
import { Skeleton } from '../../utils/statusConfig';

export default function FindRepairCenter() {
  // 1. Use the hook
  const { data: shops, loading, error, list } = useShops();

  // 2. Fetch data on component mount
  useEffect(() => {
    list(); // Call list() to fetch data
  }, []);

  // 3. Handle loading state
  if (loading) {
    return (
      <PageWrap>
        <Skeleton h={100} />
        <Skeleton h={100} />
      </PageWrap>
    );
  }

  // 4. Handle error state
  if (error) {
    return (
      <PageWrap>
        <div style={{ color: 'red', padding: '20px' }}>
          Error: {error}
        </div>
      </PageWrap>
    );
  }

  // 5. Render the data
  return (
    <PageWrap>
      {shops && shops.length > 0 ? (
        <div>
          {shops.map((shop) => (
            <div key={shop.id}>
              <h3>{shop.companyName}</h3>
              <p>{shop.address}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No shops found</p>
      )}
    </PageWrap>
  );
}
```

## Template: Creating/Submitting Data

```jsx
import { useState } from 'react';
import { useDevices } from '../../hooks/useDevices'; // Import appropriate hook

export default function MyDevices() {
  const { create, loading, error } = useDevices();
  const [formData, setFormData] = useState({
    name: '',
    deviceType: 'Smartphone',
    brand: '',
    model: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await create(formData);
      // Success - redirect or show message
      console.log('Device created:', response);
      setFormData({ name: '', deviceType: 'Smartphone', brand: '', model: '' });
    } catch (err) {
      console.error('Failed to create device:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Device name"
      />
      <input
        value={formData.brand}
        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
        placeholder="Brand"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Adding device...' : 'Add Device'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}
```

## Template: Getting Single Item

```jsx
import { useState, useEffect } from 'react';
import { useShops } from '../../hooks/useShops';

export default function ShopDetails({ shopId }) {
  const { get, loading, error } = useShops();
  const [shop, setShop] = useState(null);

  useEffect(() => {
    const loadShop = async () => {
      try {
        const data = await get(shopId);
        setShop(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadShop();
  }, [shopId, get]);

  if (loading) return <div>Loading shop details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!shop) return <div>Shop not found</div>;

  return <div>{shop.companyName}</div>;
}
```

## Template: Complex Form with Multiple Hooks

```jsx
import { useState, useEffect } from 'react';
import { useShops } from '../../hooks/useShops';
import { useDevices } from '../../hooks/useDevices';
import { useServices } from '../../hooks/useServices';
import { useAppointments } from '../../hooks/useAppointments';

export default function BookRepairFlow() {
  // Initialize all hooks
  const { data: shops, loading: shopsLoading, list: listShops } = useShops();
  const { data: devices, loading: devicesLoading, list: listDevices } = useDevices();
  const { data: services, loading: servicesLoading, list: listServices } = useServices();
  const { create: createAppointment, loading: bookingLoading, error: bookingError } = useAppointments();

  const [formData, setFormData] = useState({
    shopId: '',
    deviceId: '',
    serviceId: '',
    appointmentDate: '',
    appointmentTime: '',
  });

  // Fetch all necessary data
  useEffect(() => {
    listShops();
    listDevices();
    listServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAppointment(formData);
      // Success handling
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Select Shop */}
      <select value={formData.shopId} onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}>
        <option value="">Select a shop</option>
        {shops?.map((shop) => (
          <option key={shop.id} value={shop.id}>
            {shop.companyName}
          </option>
        ))}
      </select>

      {/* Select Device */}
      <select value={formData.deviceId} onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}>
        <option value="">Select a device</option>
        {devices?.map((device) => (
          <option key={device.id} value={device.id}>
            {device.name}
          </option>
        ))}
      </select>

      {/* Select Service */}
      <select value={formData.serviceId} onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}>
        <option value="">Select a service</option>
        {services?.map((service) => (
          <option key={service.id} value={service.id}>
            {service.name}
          </option>
        ))}
      </select>

      {/* Date and Time */}
      <input
        type="date"
        value={formData.appointmentDate}
        onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
      />
      <input
        type="time"
        value={formData.appointmentTime}
        onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
      />

      <button type="submit" disabled={bookingLoading}>
        {bookingLoading ? 'Booking...' : 'Book Appointment'}
      </button>
      {bookingError && <div style={{ color: 'red' }}>{bookingError}</div>}
    </form>
  );
}
```

## Common Hook Usage Patterns

### Pattern 1: List with Filters
```jsx
const { list } = useShops();

// Search shops
await list({ search: 'TechFix' });

// Filter by specialization
await list({ specialization: 'Mobile' });

// Multiple filters
await list({ search: 'TechFix', status: 'Open' });
```

### Pattern 2: Conditional Fetching
```jsx
useEffect(() => {
  if (userId) {
    loadUserDevices();
  }
}, [userId]);
```

### Pattern 3: Refetch Data
```jsx
const [refreshKey, setRefreshKey] = useState(0);
const { data, list } = useAppointments();

useEffect(() => {
  list();
}, [refreshKey]);

// To refetch
setRefreshKey(prev => prev + 1);
```

### Pattern 4: Error Notifications
```jsx
import { useState } from 'react';

const { create, error } = useDevices();

const [showError, setShowError] = useState(false);

useEffect(() => {
  if (error) {
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  }
}, [error]);

return (
  <>
    {showError && <ErrorNotification message={error} />}
  </>
);
```

## Data Field Mappings

### Login Response
```javascript
{
  token: 'jwt-token-here',
  user: {
    id: 'user-id',
    role: 'customer' | 'shop',
    email: 'user@example.com',
    firstName: 'John', // customer
    companyName: 'Shop Name', // shop
  }
}
```

### Shop Data
```javascript
{
  id: 'shop-id',
  companyName: 'Shop Name',
  ownerName: 'Owner Name',
  address: 'Shop Address',
  phone: '+250 7X XXX XXXX',
  specialization: 'Mobile Repair',
  rating: 4.8,
  verified: true,
}
```

### Device Data
```javascript
{
  id: 'device-id',
  userId: 'user-id',
  name: 'Device Name',
  deviceType: 'Smartphone',
  brand: 'Brand Name',
  model: 'Model',
  serialNumber: 'SN123456',
  issueDesc: 'Description of issue',
  status: 'healthy' | 'needs_repair' | 'in_repair',
}
```

### Appointment Data
```javascript
{
  id: 'apt-id',
  customerId: 'customer-id',
  shopId: 'shop-id',
  deviceId: 'device-id',
  serviceId: 'service-id',
  appointmentDate: '2026-02-28',
  appointmentTime: '10:30:00',
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled',
  deviceName: 'Device Name',
  shopName: 'Shop Name',
  serviceName: 'Service Name',
  technicianNote: 'Optional note from technician',
}
```

## Quick Reference

| Hook | Methods | Data Field |
|------|---------|-----------|
| useAuth | login, register, logout | user |
| useShops | list, get, getSlots, updateProfile | data |
| useDevices | list, get, create, update, deleteDevice | data |
| useAppointments | list, get, create, updateStatus | data |
| useServices | list, get, create | data |

All hooks return: `{ data, loading, error, ...methods }`

---

**Ready to update a component? Pick a hook and follow the templates above!**
