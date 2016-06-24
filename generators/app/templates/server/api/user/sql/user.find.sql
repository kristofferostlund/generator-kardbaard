/*
Finds all users non-disabled users
*/

SELECT
    [userId]
  , [name]
  , [email]
  , [password]
  , [customerId]
  , [dateCreated]
  , [dateUpdated]
  , [isDisabled]
FROM [dbo].[User]
WHERE [isDisabled] = 0
