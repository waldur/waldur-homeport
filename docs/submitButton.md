## submitButton directive

Used for disabling button after click to prevent double click

action function should return promise for correct directive work

if promise returns true - button will stay disabled

example:

    <a class="button-apply" submit-button="ProjectAdd.save()">Add project</a>
