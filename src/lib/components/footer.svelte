<script>
    import { links } from "$lib";
    import { Button } from "$lib/components/ui/button/index";
</script>
<div class="flex flex-col justify-around bg-secondary border-t rounded-t-4xl h-min p-10">
    <div class="mb-5">
        <img src="/banner.png" alt="MC Linker Banner" class="w-44" />
        <span class="text-muted-foreground">NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG</span>
    </div>
    <div>
        <span class="font-bold text-muted-foreground">Socials</span>
        <div class="flex flex-row items-center">
            <Button variant="ghost" href={links.socials.youTube}>
                <img src="/brands/youtube.svg" alt="YouTube Icon" class="size-5" />
                <span class="md:block hidden">YouTube</span>
            </Button>
            <Button variant="ghost" href={links.invites.server}>
                <img src="/brands/discord.svg" alt="Discord Icon" class="size-5" />
                <span class="md:block hidden">Discord</span>
            </Button>
            <Button variant="ghost" href={links.socials.topgg}>
                <img src="/brands/topgg.svg" alt="Top.gg Icon" class="" />
                <span class="md:block hidden">Top.gg</span>
            </Button>
            <Button variant="ghost" href={links.socials.github}>
                <img src="/brands/github.svg" alt="Github Icon" class="size-5" />
                <span class="md:block hidden">Github</span>
            </Button>
        </div>
    </div>
    <div>
        <span class="font-bold text-muted-foreground">Other</span>
        <div class="flex flex-row items-center">
            <Button variant="ghost" href="/team">Meet The Team</Button>
        </div>
    </div>
    <div>
        <span class="font-bold text-muted-foreground">Legal</span>
        <div class="flex flex-row items-center">
            <Button variant="ghost" href="/md/terms">Terms of Service</Button>
            <Button variant="ghost" href="/md/privacy">Privacy Policy</Button>
        </div>
    </div>
</div>
