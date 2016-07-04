/*
Creates a user to db and selects it.
*/

DECLARE @id BigInt

-- Insert the user
INSERT INTO [dbo].[User] (
    [name]
  , [email]
  , [password]
  , [customerId]
)
VALUES (
    @name
  , @email
  , @password
  , @customerId
)

SELECT @id = SCOPE_IDENTITY()

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
  WHERE [userId] = @id
