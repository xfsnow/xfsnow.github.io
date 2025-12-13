from scipy.optimize import fsolve
import matplotlib.pyplot as plt
import numpy as np

# 定义目标函数，用于求解满足条件的D点坐标
def equations(vars):
    Dx, Dy = vars
    # AB = AD = 4T (这里我们设T=1，即AB=AD=4)
    # BC + CD = 10
    AB = np.linalg.norm(A - B)
    AD = np.linalg.norm(A - np.array([Dx, Dy]))
    BC = np.linalg.norm(B - C)
    CD = np.linalg.norm(C - np.array([Dx, Dy]))
    
    # 我们希望AB=AD=4且BC+CD=10
    eq1 = AD - AB  # AD = AB
    eq2 = BC + CD - 10  # BC + CD = 10
    return [eq1, eq2]

# 计算向量间夹角的函数
def angle_between_vectors(v1, v2):
    """计算两个向量之间的夹角（弧度）"""
    cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
    # 限制cos值在[-1, 1]范围内，防止数值误差导致的问题
    cos_angle = np.clip(cos_angle, -1, 1)
    angle = np.arccos(cos_angle)
    return angle

# 计算顶点角度的函数
def compute_vertex_angle(vertex, point1, point2):
    """计算顶点处两个边的夹角"""
    vec1 = point1 - vertex
    vec2 = point2 - vertex
    return angle_between_vectors(vec1, vec2)

# 定义新的目标函数，用于同时优化D、E、F点以满足所有条件
def full_equations(vars):
    Dx, Dy, t_E, t_F = vars
    
    # 点坐标
    D = np.array([Dx, Dy])
    E = B + t_E * (C - B)  # E在BC边上
    F = C + t_F * (D - C)  # F在CD边上
    
    # 几何条件
    AB = np.linalg.norm(A - B)
    AD = np.linalg.norm(A - D)
    BC = np.linalg.norm(B - C)
    CD = np.linalg.norm(C - D)
    
    # 角度条件
    AE = E - A
    AF = F - A
    AB_vec = B - A
    AD_vec = D - A
    
    angle_EAF = angle_between_vectors(AE, AF)
    angle_BAD = angle_between_vectors(AB_vec, AD_vec)
    half_angle_BAD = angle_BAD / 2
    
    # 方程组
    eq1 = AD - AB                           # AB = AD
    eq2 = BC + CD - 10                      # BC + CD = 10
    eq3 = angle_EAF - half_angle_BAD        # ∠EAF = ½∠BAD
    eq4 = t_E - 0.4                         # 调整E点位置，使其更靠左
    
    return [eq1, eq2, eq3, eq4]

# 设置图形
fig, ax = plt.subplots(figsize=(8, 6))
ax.set_aspect('equal')
ax.axis('off')  # 不显示坐标轴

# 根据题目给出的坐标设置各个点
A = np.array([2.2943, 3.2766])
B = np.array([0.0000, 0.0000])
C = np.array([6.8000, 0.0000])

# 计算满足条件的D点坐标
# 初始猜测值为(5.8, 2.5)
D_sol = fsolve(equations, [5.8, 2.5])
D = np.array(D_sol)

# 通过优化方法计算满足所有条件的E和F点位置
# 初始猜测: D点(5.8, 2.5), E点参数0.4(比之前更靠左), F点参数0.4(比之前更靠下)
full_sol = fsolve(full_equations, [D[0], D[1], 0.4, 0.4])
D_opt = np.array([full_sol[0], full_sol[1]])
E_param = full_sol[2]
F_param = full_sol[3]

# 更新点坐标
D = D_opt
# 再次微调D点位置，使其向下移动一些
D[1] -= 0.1  # D点Y坐标减少，即向下移动
E = B + E_param * (C - B)  # E在BC边上
F = C + F_param * (D - C)  # F在CD边上

# 计算G点，使BG = DF，且G在EB的延长线上
# EB向量
EB_vec = B - E
# 单位化的EB向量
EB_unit = EB_vec / np.linalg.norm(EB_vec)
# BG的长度等于DF的长度
DF_length = np.linalg.norm(D - F)
# G点坐标
G = B + EB_unit * DF_length

# 绘制四边形ABCD
points_ABCD = [A, B, C, D, A]
x_ABCD = [p[0] for p in points_ABCD]
y_ABCD = [p[1] for p in points_ABCD]
ax.plot(x_ABCD, y_ABCD, 'k-', linewidth=1.5)

# 绘制AE、AF、EF
ax.plot([A[0], E[0]], [A[1], E[1]], 'k-', linewidth=1)  # AE改为实线
ax.plot([A[0], F[0]], [A[1], F[1]], 'k-', linewidth=1)  # AF改为实线
ax.plot([E[0], F[0]], [E[1], F[1]], 'k-', linewidth=1.5)

# 绘制辅助线AG和BG
# ax.plot([A[0], G[0]], [A[1], G[1]], 'k--', linewidth=1)  # AG用虚线
# ax.plot([B[0], G[0]], [B[1], G[1]], 'k--', linewidth=1)  # BG用虚线

# 标注点（使用斜体Roman体）
ax.text(A[0], A[1], 'A', fontsize=16, ha='right', va='bottom', fontfamily='serif', style='italic')
ax.text(B[0], B[1]-0.1, 'B', fontsize=16, ha='right', va='top', fontfamily='serif', style='italic')
ax.text(C[0], C[1], 'C', fontsize=16, ha='left', va='top', fontfamily='serif', style='italic')
ax.text(D[0], D[1]+0.1, 'D', fontsize=16, ha='left', va='bottom', fontfamily='serif', style='italic')
ax.text(E[0], E[1]-0.1, 'E', fontsize=14, ha='center', va='top', fontfamily='serif', style='italic')
ax.text(F[0]+0.1, F[1], 'F', fontsize=14, ha='left', va='center', fontfamily='serif', style='italic')
# ax.text(G[0]-0.1, G[1]-0.25, 'G', fontsize=14, ha='left', va='center', fontfamily='serif', style='italic')

# 设置图形范围
all_points = np.array([A, B, C, D, E, F, G])
x_min, x_max = all_points[:,0].min() - 1, all_points[:,0].max() + 1
y_min, y_max = all_points[:,1].min() - 1, all_points[:,1].max() + 1
ax.set_xlim(x_min, x_max)
ax.set_ylim(y_min, y_max)

# 计算并打印三角形CEF的周长
CE = np.linalg.norm(C - E)
EF = np.linalg.norm(E - F)
FC = np.linalg.norm(F - C)
perimeter = CE + EF + FC

# 计算AB, AD, BC, CD长度以验证条件
AB = np.linalg.norm(A - B)
AD = np.linalg.norm(A - D)
BC = np.linalg.norm(B - C)
CD = np.linalg.norm(C - D)

# 计算角度 ∠EAF 和 ½∠BAD
# 向量 AE 和 AF 之间的夹角
AE_vec = E - A
AF_vec = F - A
angle_EAF = angle_between_vectors(AE_vec, AF_vec)

# 向量 AB 和 AD 之间的夹角
AB_vec = B - A
AD_vec = D - A
angle_BAD = angle_between_vectors(AB_vec, AD_vec)
half_angle_BAD = angle_BAD / 2

# 计算A、B、C、D四个角的度数
angle_A = compute_vertex_angle(A, B, D)  # 四边形内角A
angle_B = compute_vertex_angle(B, A, C)  # 四边形内角B
angle_C = compute_vertex_angle(C, B, D)  # 四边形内角C
angle_D = compute_vertex_angle(D, A, C)  # 四边形内角D

print(f"AB = {AB:.4f}")
print(f"AD = {AD:.4f}")
print(f"BC = {BC:.4f}")
print(f"CD = {CD:.4f}")
print(f"BC + CD = {BC + CD:.4f}")
print(f"|AB - AD| = {abs(AB - AD):.4f}")
print(f"∠BAD = {np.degrees(angle_BAD):.4f}°")
print(f"½∠BAD = {np.degrees(half_angle_BAD):.4f}°")
print(f"∠EAF = {np.degrees(angle_EAF):.4f}°")
print(f"|∠EAF - ½∠BAD| = {np.degrees(abs(angle_EAF - half_angle_BAD)):.4f}°")
print(f"E点参数 (BE/BC) = {E_param:.4f}")
print(f"F点参数 (CF/CD) = {F_param:.4f}")
print(f"∠A (四边形内角) = {np.degrees(angle_A):.4f}°")
print(f"∠B (四边形内角) = {np.degrees(angle_B):.4f}°")
print(f"∠C (四边形内角) = {np.degrees(angle_C):.4f}°")
print(f"∠D (四边形内角) = {np.degrees(angle_D):.4f}°")
print(f"CE = {CE:.4f}")
print(f"EF = {EF:.4f}")
print(f"FC = {FC:.4f}")
print(f"三角形CEF的周长 = {perimeter:.4f}")
print("\n各点坐标:")
print(f"A: ({A[0]:.4f}, {A[1]:.4f})")
print(f"B: ({B[0]:.4f}, {B[1]:.4f})")
print(f"C: ({C[0]:.4f}, {C[1]:.4f})")
print(f"D: ({D[0]:.4f}, {D[1]:.4f})")
print(f"E: ({E[0]:.4f}, {E[1]:.4f})")
print(f"F: ({F[0]:.4f}, {F[1]:.4f})")
print(f"G: ({G[0]:.4f}, {G[1]:.4f})")

plt.show()