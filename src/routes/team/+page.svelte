<script lang="ts">
    import Person from "$lib/components/person.svelte";
    import { team } from "$lib/index";
</script>
<h1 class="font-bold text-4xl mt-10">The Team</h1>
<div class="md:w-3xl w-xs flex flex-col gap-5 my-10">
    {#each team.core as person}
        <Person
            username={person.username}
            github={person.github}
            about={person.about}
            roles={person.roles}
        />
    {/each}
    <h1 class="font-bold text-4xl m-5 text-center">Special Thanks</h1>
    <div class="flex md:flex-row flex-col gap-5">
        {#each team.specialthanks as person}
            <Person
                username={person.username}
                github={person.github}
                roles={person.roles}
            />
        {/each}
    </div>
</div>