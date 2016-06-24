/*
Updates a user to db and selects it.

Note: the password is not updated this way.
*/

-- Update the user
UPDATE [dbo].[User]
SET
    [name] = @name
  , [email] = @email
  , [customerId] = @customerId
  , [dateUpdated] = GETUTCDATE()
WHERE [userId] = @userId

-- Select it
SELECT
    [userId]
  , [name]
  , [email]
  , [customerId]
  , [dateCreated]
  , [dateUpdated]
  , [isDisabled]
FROM [dbo].[User]
WHERE [userId] = @userId
