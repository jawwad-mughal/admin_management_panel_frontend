# RBAC Quick Reference Card

## 🚀 Most Used Patterns

### Pattern 1: Show Button Only to Authorized Users
```typescript
<Protected permission="products:delete">
  <button onClick={handleDelete}>Delete</button>
</Protected>
```

### Pattern 2: Show Section Only to Specific Roles
```typescript
<Protected role={["Admin", "BranchManager"]}>
  <div>Admin Features</div>
</Protected>
```

### Pattern 3: Check in JavaScript Code
```typescript
const { can } = usePermissions();

if (can("products:edit")) {
  // Show edit UI
}
```

### Pattern 4: Show Fallback When No Permission
```typescript
<Protected 
  permission="orders:delete"
  fallback={<p>You don't have permission to delete orders</p>}
>
  <button>Delete Order</button>
</Protected>
```

---

## 📋 Common Permissions

```
users:create     users:read       users:update     users:delete
products:create  products:read    products:update  products:delete
categories:*     orders:*         branches:*       reports:*
```

---

## 👥 Roles & Default Access

| Role | Can Create | Can Edit | Can Delete | Can View All |
|------|-----------|----------|-----------|-------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ |
| **BranchManager** | ✅ Branch only | ✅ | ✅ | ❌ Other branches |
| **Employee** | ❌ | ❌ | ❌ | ✅ Branch only |
| **User** | ❌ | ❌ | ❌ | Last items |

---

## 🎯 Permission Object Methods

```typescript
const {
  can,              // can("permission:action")
  canAny,           // canAny(["perm1", "perm2"])
  canAll,           // canAll(["perm1", "perm2"])
  hasRole,          // hasRole(["Admin", "BranchManager"])
  isAdmin,          // isAdmin()
  isBranchManager,  // isBranchManager()
  isEmployee,       // isEmployee()
  getPermissions,   // getPermissions()
} = usePermissions();
```

---

## 🔒 Implementation Checklist

- [ ] Wrap create button with `<Protected permission="x:create">`
- [ ] Wrap edit button with `<Protected permission="x:update">`
- [ ] Wrap delete button with `<Protected permission="x:delete">`
- [ ] Add fallback UI for read-only users
- [ ] Test with Admin role (should see everything)
- [ ] Test with BranchManager role (should see limited)
- [ ] Test with Employee role (read-only)
- [ ] Backend validates permissions on API

---

## 💾 Page Implementation Status

| Page | Status | Notes |
|------|--------|-------|
| Users | ✅ | All CRUD buttons protected |
| Products | ✅ | Create/Edit/Delete protected |
| Categories | ✅ | CRUD buttons protected |
| Orders | ✅ | Create/Delete protected |
| Branches | ✅ | Create/Edit/Delete protected |
| Reports | ✅ | Export/Refresh protected |
| Settings | ✅ | Personal settings (no protection) |

---

## 🚨 Common Mistakes

```
❌ <button onClick={delete}>Delete</button>
✅ <Protected permission="x:delete">
     <button onClick={delete}>Delete</button>
   </Protected>

❌ if (userRole === "Admin") // Frontend only ⚠️
✅ Backend API should validate permission

❌ Multiple permission checks scattered
✅ Use <Protected> component consistently

❌ No fallback for denied access
✅ Show clear message when user can't act
```

---

## 📱 Copy-Paste Templates

### Add Protected CRUD Button Set
```typescript
<td className="flex gap-3">
  <Protected permission="users:update">
    <button onClick={() => editUser(user._id)}>Edit</button>
  </Protected>
  
  <Protected permission="users:delete">
    <button onClick={() => deleteUser(user._id)}>Delete</button>
  </Protected>
</td>
```

### Add Role-Based Header Section
```typescript
<div className="flex justify-between">
  <h1>Dashboard</h1>
  <Protected role={["Admin"]}>
    <button>Admin Tools</button>
  </Protected>
</div>
```

### Add Read-Only Notice
```typescript
<Protected
  permission="products:create"
  fallback={
    <div className="bg-yellow-100 p-3 rounded">
      📖 Read-only access
    </div>
  }
/>
```

---

## 🧪 Testing Quick Steps

```bash
# Test Admin
1. Login as admin@example.com
2. Check if all buttons visible
3. Try all CRUD operations → Should work

# Test BranchManager
1. Login as manager@example.com
2. Check if branch filter applied
3. Try creating for another branch → Should fail

# Test Employee
1. Login as emp@example.com
2. Check if create buttons hidden
3. Try accessing admin page → Should fail

# Test User
1. Login as user@example.com
2. Check if minimal features visible
3. Try any admin action → Should fail
```

---

## 🔗 Permission Dependency

Some permissions depend on others:

```
orders:create → requires user:read (to assign to user)
products:create → requires categories:read (dropdown)
categories:create → requires branches:read (dropdown)
branches:update → requires admin:verify (security action)
```

---

## 📚 Quick Links

| Resource | Location | Purpose |
|----------|----------|---------|
| Permissions Hook | `lib/usePermissions.ts` | Check what user can do |
| Protected Component | `components/Protected.tsx` | Conditional rendering |
| Auth Context | `lib/auth-context.tsx` | User & token management |
| Usage Guide | `PERMISSIONS_GUIDE.md` | Detailed examples |
| Branch Filtering | `BRANCH_FILTERING_GUIDE.md` | Multi-branch data setup |
| Full Summary | `RBAC_IMPLEMENTATION_SUMMARY.md` | Complete overview |

---

## ⚡ Lightning Tips

- Always import `Protected` from `"@/lib"`
- Permission strings are case-sensitive
- Use fallback UI for better UX
- Test with real API calls, not mocked
- Backend must validate every permission
- Clear cache if permissions don't update
- Use `usePermissions()` for logic, `Protected` for UI

---

## 🎓 Learning Path

1. **Day 1**: Read `PERMISSIONS_GUIDE.md`
2. **Day 2**: Review `Protected.tsx` component code
3. **Day 3**: Implement on 1-2 pages
4. **Day 4**: Implement on all pages
5. **Day 5**: Full testing across all roles
6. **Day 6**: Backend validation (optional)
7. **Day 7**: Production deployment

---

## 💬 FAQ

**Q: Do I need to protect every button?**  
A: Yes, for security and UX. Users shouldn't see actions they can't perform.

**Q: What if I forget the permission string?**  
A: Check `lib/usePermissions.ts` for the complete list.

**Q: Will the API reject unauthorized actions?**  
A: Yes, frontend is just for UX. Backend validates everything.

**Q: How do I add new permissions?**  
A: Update permission arrays in backend User model and `getDefaultPermissions()`.

**Q: Can I use Protected for styling/conditionals?**  
A: Yes! Use `<If>`, `<Show>`, `<Hide>` for generic conditionals.

**Q: How do users get permissions?**  
A: Assigned via role. Admins can grant specific permissions via API.

---

## 🎯 One-Liner Summary

**Show UI/buttons only to users with proper permissions using `<Protected>` component!**

---

Version: 1.0 | Last Updated: 2024 | Status: Production Ready
