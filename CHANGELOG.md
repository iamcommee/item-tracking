1.1.0
---
2021-02-09
- Added edit mode for admin
- Added feature `tags` support

1.0.2
---
2021-02-02
- Datatable: Make data table sortable by book/device names
- Mode selector: Set primary color to only the current itemType to make it more clear which one is active.
- Layout: Use 22 columns for xs layout instead of 3 to add some spaces on the left and right.
- Borrow dialog: display item name in the dialog header, remove id and name fields.
- (Refactor) Create filters to transform strings. Rename capitalizeFirstLetter to just capitalize because capitalize is already = just the first letter.

1.0.1
---
2021-01-26
- Improved table UI from [@armno](https://github.com/armno)
   - Changed column name from `Status` to `Availability`
   - Added Borrower's name to `Availability` column
   - Removed Search box 
   - Removed Borrower column
   - Fixed item name can not show with fullname
