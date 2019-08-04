import 'jquery'

export = function getFlag(name: string): boolean {
    const id = "flags-" + name.replace(' ', '-');
    let element = (document.getElementById(id) as HTMLInputElement);
    if (element == null) {
        const input = $<HTMLInputElement>("<input type=\"checkbox\" checked>");
        const label = $("<label></label>");
        input.attr('id', id);
        label.attr('for', id);
        label.text(name);
        $("#flags").append(
            input,
            label,
            $("<br>")
        );
        element = input.get(0);
    }
    return element.checked
}
