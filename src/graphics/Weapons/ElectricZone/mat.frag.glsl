varying vec2 vUv;
uniform float time;

#define detail_steps 13
#define mod3 vec3(.1031, .11369, .13787)

vec3 hash3_3(vec3 p3) {
    p3 = fract(p3 * mod3);
    p3 += dot(p3, p3.yxz + 19.19);
    return -1.0 + 2.0 * fract(vec3((p3.x + p3.y) * p3.z, (p3.x+p3.z) * p3.y, (p3.y+p3.z) * p3.x));
}

float perlin_noise3(vec3 p) {
    vec3 pi = floor(p);
    vec3 pf = p - pi;

    vec3 w = pf * pf * (3.0 - 2.0 * pf);

    return mix(
        mix(
            mix(
                dot(pf - vec3(0, 0, 0), hash3_3(pi + vec3(0, 0, 0))),
                dot(pf - vec3(1, 0, 0), hash3_3(pi + vec3(1, 0, 0))),
                w.x),
            mix(
                dot(pf - vec3(0, 0, 1), hash3_3(pi + vec3(0, 0, 1))),
                dot(pf - vec3(1, 0, 1), hash3_3(pi + vec3(1, 0, 1))),
                w.x),
            w.z),
        mix(
            mix(
                dot(pf - vec3(0, 1, 0), hash3_3(pi + vec3(0, 1, 0))),
                dot(pf - vec3(1, 1, 0), hash3_3(pi + vec3(1, 1, 0))),
                w.x),
            mix(
                dot(pf - vec3(0, 1, 1), hash3_3(pi + vec3(0, 1, 1))),
                dot(pf - vec3(1, 1, 1), hash3_3(pi + vec3(1, 1, 1))),
                w.x),
            w.z),
        w.y);
}

float noise_sum_abs3(vec3 p) {
    float f = 0.0;
    p = p * 3.0;
    f += 1.0000 * abs(perlin_noise3(p)); p = 2.0 * p;
    f += 0.5000 * abs(perlin_noise3(p)); p = 3.0 * p;
    f += 0.2500 * abs(perlin_noise3(p)); p = 4.0 * p;
    f += 0.1250 * abs(perlin_noise3(p)); p = 5.0 * p;
    f += 0.0625 * abs(perlin_noise3(p)); p = 6.0 * p;

    return f;
}

void main() {
    vec2 p = vUv * 2.0 - 1.0;

    float electric_density = 0.9;
    float electric_radius = length(p) - 0.4;
    float velocity = 0.1;

    float moving_coord = sin(velocity * time) / 0.2 * cos(velocity * time);
    vec3 electric_local_domain = vec3(p, moving_coord);
    float electric_field = electric_density * noise_sum_abs3(electric_local_domain);

    vec3 col = vec3(107.0/255.0, 148.0/255.0, 196.0/255.0);
    col += (1.0 - (electric_field + electric_radius));

    for(int i = 0; i < detail_steps; i++) {
        if(length(col) >= 2.1 + float(i) / 2.0)
        col -= 0.3;
    }

    col += 1.0 - 4.2*electric_field;

    // Ограничиваем эффект кругом
    float mask = smoothstep(1.0, 0.6, length(p));
    col *= mask;

    // Добавляем виньетку
    float dist = length(p);
    float vignette = smoothstep(0.6, 1.0, dist); // Контролируем размер виньетки
    float alpha = mask > 0.2 ? 0.6 : 0.0;

    alpha *= (1.0 - vignette);

    gl_FragColor = vec4(col, alpha);
}
