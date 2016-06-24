/*
Disables the <%= name %> at @<%= name %>Id
*/

UPDATE [dbo].[<%= nameCapitalized %>]
SET
    [isDisabled] = 1
  , [dateUpdated] = GETUTCDATE()
WHERE [<%= name %>Id] = @<%= name %>Id